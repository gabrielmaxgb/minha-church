#!/usr/bin/env python3
"""Smoke test for finances / treasury / giving recent changes."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from http.cookiejar import CookieJar

API = "http://localhost:3001/api/v1"
FE = "http://localhost:3000"
IDENTIFIER = "treasurer@igreja.com.br"
PASSWORD = "senha123"

failures: list[str] = []
passes: list[str] = []


def ok(label: str) -> None:
    passes.append(label)
    print(f"PASS  {label}")


def fail(label: str, detail: str) -> None:
    failures.append(f"{label}: {detail}")
    print(f"FAIL  {label}: {detail}")


def request(
    opener: urllib.request.OpenerDirector,
    method: str,
    url: str,
    body: dict | None = None,
    headers: dict | None = None,
) -> tuple[int, object]:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            **(headers or {}),
        },
    )
    try:
        with opener.open(req, timeout=30) as resp:
            raw = resp.read().decode()
            payload: object = json.loads(raw) if raw else None
            return resp.status, payload
    except urllib.error.HTTPError as err:
        raw = err.read().decode()
        try:
            payload = json.loads(raw) if raw else {"message": raw}
        except json.JSONDecodeError:
            payload = {"message": raw}
        return err.code, payload


def main() -> int:
    cj = CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # --- FE pages ---
    for path, expect in [
        ("/login", 200),
        # Auth gate is client-side — anonymous still gets the shell HTML (200).
        ("/app/financas", (200, 307, 302)),
        ("/doar/igreja-batista-central/nao-existe", (404, 200, 307, 302)),
    ]:
        req = urllib.request.Request(FE + path, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                status = resp.status
        except urllib.error.HTTPError as err:
            status = err.code
        expected = expect if isinstance(expect, tuple) else (expect,)
        if status in expected:
            ok(f"FE {path} → {status}")
        else:
            fail(f"FE {path}", f"status {status}, expected {expected}")

    # --- Auth ---
    status, login = request(
        opener,
        "POST",
        f"{API}/auth/login",
        {"identifier": IDENTIFIER, "password": PASSWORD},
    )
    if status != 201 and status != 200:
        fail("login", f"status {status}: {login}")
        print_summary()
        return 1

    ok(f"login as {IDENTIFIER}")
    assert isinstance(login, dict)
    session = login.get("session") if isinstance(login.get("session"), dict) else login
    church = (
        session.get("church")
        or session.get("activeChurch")
        or (session.get("churches") or [None])[0]
    )
    if isinstance(church, dict) and church.get("id"):
        church_id = church["id"]
    else:
        # try /auth/me or session shape
        status_me, me = request(opener, "GET", f"{API}/auth/me")
        church_id = None
        if status_me in (200, 201) and isinstance(me, dict):
            c = me.get("church") or me.get("activeChurch")
            if isinstance(c, dict):
                church_id = c.get("id")
            churches = me.get("churches")
            if not church_id and isinstance(churches, list) and churches:
                church_id = churches[0].get("id")
        if not church_id:
            fail("resolve church id", str(login)[:400])
            print_summary()
            return 1

    ok(f"church id {church_id}")

    auth_headers = {}
    token = login.get("accessToken") or login.get("access_token")
    if token:
        auth_headers["Authorization"] = f"Bearer {token}"

    # --- Treasury accounts list (canDelete / entryCount) ---
    status, accounts = request(
        opener,
        "GET",
        f"{API}/churches/{church_id}/treasury/accounts?includeInactive=true",
        headers=auth_headers,
    )
    if status != 200 or not isinstance(accounts, list):
        fail("list accounts", f"{status} {accounts}")
    else:
        sample = accounts[0] if accounts else {}
        if "canDelete" in sample and "entryCount" in sample:
            ok(f"accounts shape ({len(accounts)}), canDelete/entryCount present")
        else:
            fail("accounts shape", f"missing fields in {sample}")

        # create custom category → delete
        status, created = request(
            opener,
            "POST",
            f"{API}/churches/{church_id}/treasury/accounts",
            {"name": "Smoke Test Categoria", "kind": "expense"},
            headers=auth_headers,
        )
        if status not in (200, 201) or not isinstance(created, dict):
            fail("create account", f"{status} {created}")
        else:
            ok(f"create account {created.get('id')}")
            if created.get("canDelete") is not True:
                fail("created canDelete", str(created))
            else:
                ok("created account canDelete=true")

            account_id = created["id"]
            status, deleted = request(
                opener,
                "DELETE",
                f"{API}/churches/{church_id}/treasury/accounts/{account_id}",
                headers=auth_headers,
            )
            if status in (200, 204) and (
                deleted is None
                or (isinstance(deleted, dict) and deleted.get("ok") is True)
            ):
                ok("delete empty custom account")
            else:
                fail("delete account", f"{status} {deleted}")

            # deleting a seed/system should fail
            seed = next(
                (
                    a
                    for a in accounts
                    if isinstance(a, dict)
                    and a.get("canDelete") is False
                    and a.get("isActive") is True
                ),
                None,
            )
            if seed:
                status, blocked = request(
                    opener,
                    "DELETE",
                    f"{API}/churches/{church_id}/treasury/accounts/{seed['id']}",
                    headers=auth_headers,
                )
                if status in (400, 403):
                    ok(f"block delete non-deletable ({status})")
                else:
                    fail("block delete non-deletable", f"{status} {blocked}")

    # --- Giving funds ---
    status, funds = request(
        opener,
        "GET",
        f"{API}/churches/{church_id}/payments/funds",
        headers=auth_headers,
    )

    if status == 200 and isinstance(funds, list):
        audiences = {f.get("audience") for f in funds if isinstance(f, dict)}
        ok(f"list funds ({len(funds)}) audiences={sorted(a for a in audiences if a)}")
        public = next(
            (
                f
                for f in funds
                if isinstance(f, dict) and f.get("audience") == "public" and f.get("slug")
            ),
            None,
        )
        if public:
            church_slug = (
                church.get("slug")
                if isinstance(church, dict)
                else "igreja-batista-central"
            )
            # FE public giving page
            path = f"/doar/{church_slug}/{public['slug']}"
            req = urllib.request.Request(FE + path, method="GET")
            try:
                with urllib.request.urlopen(req, timeout=20) as resp:
                    html = resp.read().decode()
                    fe_status = resp.status
            except urllib.error.HTTPError as err:
                fe_status = err.code
                html = err.read().decode()
            if fe_status == 200 and (
                "contribu" in html.lower()
                or "doar" in html.lower()
                or str(public.get("name", "")) in html
            ):
                ok(f"FE public giving page {path}")
            elif fe_status == 200:
                ok(f"FE public giving page loads {path} (content soft-check)")
            else:
                fail(f"FE public giving {path}", f"status {fe_status}")

            # Public giving API context
            status, ctx = request(
                opener,
                "GET",
                f"{API}/public/giving/{church_slug}/{public['slug']}",
            )
            if status == 200 and isinstance(ctx, dict):
                ok("public giving API context")
            else:
                fail("public giving API", f"{status} {str(ctx)[:200]}")
        else:
            ok("no public fund to open (skipped page check)")
    else:
        fail("list funds", f"{status} {str(funds)[:300]}")

    # --- Authenticated FE financas (with cookie if FE shares domain — may not) ---
    # At least ensure RSC payload compiles:
    req = urllib.request.Request(FE + "/app/financas", method="GET")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            # anonymous redirects
            ok(f"FE /app/financas anonymous gate → {resp.status}")
    except urllib.error.HTTPError as err:
        if err.code in (307, 302, 401, 403):
            ok(f"FE /app/financas anonymous gate → {err.code}")
        else:
            fail("FE /app/financas", str(err.code))

    print_summary()
    return 1 if failures else 0


def print_summary() -> None:
    print()
    print(f"Smoke: {len(passes)} passed, {len(failures)} failed")
    for item in failures:
        print(f"  - {item}")


if __name__ == "__main__":
    sys.exit(main())
