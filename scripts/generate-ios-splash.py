#!/usr/bin/env python3
"""Gera splash screens iOS (apple-touch-startup-image) + lib/pwa/ios-splash.ts.

Uso (na pasta minha-church):
  python3 scripts/generate-ios-splash.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BG = (245, 245, 242)  # --background
MARK_SRC = ROOT / "public" / "marketing" / "logo-mark.png"
OUT_DIR = ROOT / "public" / "splash"
TS_OUT = ROOT / "lib" / "pwa" / "ios-splash.ts"

# (device_width_css, device_height_css, dpr, portrait_pixel_label)
DEVICES = [
    (320, 568, 2, "640x1136"),
    (375, 667, 2, "750x1334"),
    (414, 736, 3, "1242x2208"),
    (375, 812, 3, "1125x2436"),
    (414, 896, 2, "828x1792"),
    (414, 896, 3, "1242x2688"),
    (360, 780, 3, "1080x2340"),
    (390, 844, 3, "1170x2532"),
    (428, 926, 3, "1284x2778"),
    (393, 852, 3, "1179x2556"),
    (430, 932, 3, "1290x2796"),
    (402, 874, 3, "1206x2622"),
    (440, 956, 3, "1320x2868"),
    (768, 1024, 2, "1536x2048"),
    (834, 1194, 2, "1668x2388"),
    (1024, 1366, 2, "2048x2732"),
]


def extract_dove(src: Image.Image) -> Image.Image:
    """Remove fundo preto do logo-mark."""
    src = src.convert("RGBA")
    w, h = src.size
    px = src.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8 or (r <= 28 and g <= 28 and b <= 28):
                continue
            op[x, y] = (r, g, b, a)
    bbox = out.getbbox()
    if not bbox:
        raise SystemExit("pomba não encontrada no logo-mark")
    return out.crop(bbox)


def make_splash(dove: Image.Image, pw: int, ph: int) -> Image.Image:
    canvas = Image.new("RGBA", (pw, ph), (*BG, 255))
    short = min(pw, ph)
    size = max(120, int(short * 0.22))
    dw, dh = dove.size
    ratio = size / max(dw, dh)
    nw, nh = max(1, int(dw * ratio)), max(1, int(dh * ratio))
    logo = dove.resize((nw, nh), Image.Resampling.LANCZOS)
    alpha = logo.split()[3]
    shadow = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    shadow.putalpha(alpha.point(lambda p: int(p * 0.10)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(6, size // 20)))
    x = (pw - nw) // 2
    y = (ph - nh) // 2
    canvas.alpha_composite(shadow, (x + 2, y + 4))
    canvas.alpha_composite(logo, (x, y))
    return canvas.convert("RGB")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    dove = extract_dove(Image.open(MARK_SRC))
    entries: list[dict[str, str]] = []

    for css_w, css_h, dpr, label in DEVICES:
        pw, ph = css_w * dpr, css_h * dpr
        path_p = OUT_DIR / f"apple-splash-{label}.png"
        make_splash(dove, pw, ph).save(path_p, format="PNG", optimize=True)
        entries.append(
            {
                "url": f"/splash/apple-splash-{label}.png",
                "media": (
                    f"screen and (device-width: {css_w}px) and (device-height: {css_h}px) "
                    f"and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)"
                ),
            }
        )

        label_l = f"{ph}x{pw}"
        path_l = OUT_DIR / f"apple-splash-{label_l}.png"
        make_splash(dove, ph, pw).save(path_l, format="PNG", optimize=True)
        entries.append(
            {
                "url": f"/splash/apple-splash-{label_l}.png",
                "media": (
                    f"screen and (device-width: {css_w}px) and (device-height: {css_h}px) "
                    f"and (-webkit-device-pixel-ratio: {dpr}) and (orientation: landscape)"
                ),
            }
        )
        print(f"wrote {label}")

    lines = [
        "/** Splash screens iOS (apple-touch-startup-image). Gerado por scripts/generate-ios-splash.py */",
        "export const IOS_SPLASH_IMAGES = [",
    ]
    for e in entries:
        lines.append("  {")
        lines.append(f'    url: "{e["url"]}",')
        lines.append(f'    media: "{e["media"]}",')
        lines.append("  },")
    lines.append("] as const;")
    lines.append("")
    TS_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {TS_OUT.relative_to(ROOT)} ({len(entries)} entries)")


if __name__ == "__main__":
    main()
