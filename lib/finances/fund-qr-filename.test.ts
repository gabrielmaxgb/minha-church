import assert from "node:assert/strict";
import { describe, it } from "node:test";
import QRCode from "qrcode";

import { slugifyFundQrFilename } from "./fund-qr-filename";

describe("slugifyFundQrFilename", () => {
  it("strips accents and spaces", () => {
    assert.equal(slugifyFundQrFilename("Missão Ásia 2026"), "missao-asia-2026");
  });

  it("falls back when empty after sanitize", () => {
    assert.equal(slugifyFundQrFilename("@@@"), "fundo");
    assert.equal(slugifyFundQrFilename(""), "fundo");
  });

  it("truncates long names", () => {
    const long = "a".repeat(80);
    assert.equal(slugifyFundQrFilename(long).length, 48);
  });
});

describe("fund QR generation", () => {
  it("produces a PNG data URL for a public giving link", async () => {
    const dataUrl = await QRCode.toDataURL(
      "https://app.minhachurch.com/doar/igreja-batista-central/missoes",
      {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 240,
        color: { dark: "#101512", light: "#ffffff" },
      },
    );

    assert.match(dataUrl, /^data:image\/png;base64,/);
    assert.ok(dataUrl.length > 200);
  });
});
