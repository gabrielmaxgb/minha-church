const { chromium } = require("playwright");

const FE = process.env.FE_URL || "http://localhost:3000";
const IDENTIFIER = "treasurer@igreja.com.br";
const PASSWORD = "senha123";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  const check = async (label, fn) => {
    try {
      await fn();
      results.push({ label, ok: true });
      console.log(`PASS  ${label}`);
    } catch (err) {
      results.push({ label, ok: false, err: String(err.message || err) });
      console.log(`FAIL  ${label}: ${err.message || err}`);
      const shot = `/tmp/mc-smoke-fail-${label.replace(/\W+/g, "-").slice(0, 40)}.png`;
      try {
        await page.screenshot({ path: shot, fullPage: true });
        console.log(`      screenshot: ${shot}`);
      } catch {
        /* ignore */
      }
    }
  };

  await check("login page loads", async () => {
    await page.goto(`${FE}/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("#identifier");
  });

  await check("login as treasurer", async () => {
    await page.fill("#identifier", IDENTIFIER);
    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app(\/|$)/, { timeout: 45000 });
  });

  await check("financas page + tabs", async () => {
    await page.goto(`${FE}/app/financas`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Finanças" }).first().waitFor({
      timeout: 20000,
    });
    for (const label of ["Fundos", "Entradas", "Recorrentes", "Repasses", "Caixa"]) {
      await page.getByRole("tab", { name: label }).waitFor({ timeout: 10000 });
    }
  });

  await check("fundos shows compartilháveis / só membros", async () => {
    await page.getByRole("tab", { name: "Fundos" }).click();
    await page.getByText("Compartilháveis").first().waitFor({ timeout: 15000 });
    await page.getByText(/Só (para )?membros/i).first().waitFor({ timeout: 10000 });
  });

  await check("QR code modal opens and renders image", async () => {
    const qrBtn = page.getByRole("button", { name: /QR code/i }).first();
    await qrBtn.waitFor({ timeout: 15000 });
    await qrBtn.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ timeout: 10000 });
    const img = dialog.locator("img").first();
    await img.waitFor({ timeout: 20000 });
    const src = await img.getAttribute("src");
    if (!src || (!src.startsWith("data:image") && !src.startsWith("blob:"))) {
      throw new Error(`unexpected QR img src: ${src}`);
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 }).catch(async () => {
      await dialog.waitFor({ state: "detached", timeout: 5000 });
    });
  });

  await check("caixa opens categorias modal", async () => {
    await page.getByRole("tab", { name: "Caixa" }).click();
    const openCats = page.getByRole("button", { name: /^Categorias$/i });
    await openCats.first().waitFor({ timeout: 15000 });
    await openCats.first().click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    await page.getByRole("heading", { name: /Categorias do caixa/i }).waitFor({
      timeout: 10000,
    });
    await page.keyboard.press("Escape");
  });

  await check("hash #categorias opens modal", async () => {
    await page.goto(`${FE}/app/financas#categorias`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("heading", { name: /Categorias do caixa/i }).waitFor({
      timeout: 15000,
    });
  });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\nUI smoke: ${results.length - failed.length} passed, ${failed.length} failed`,
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
