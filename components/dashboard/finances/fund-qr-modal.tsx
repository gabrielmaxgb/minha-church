"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Download, Loader2, Printer, QrCode, X } from "lucide-react";
import QRCode from "qrcode";

import { ModalPortal } from "@/components/ui/modal-portal";
import { Button } from "@/components/ui/button";
import { slugifyFundQrFilename } from "@/lib/finances/fund-qr-filename";
import { cn } from "@/lib/utils";

type FundQrModalProps = {
  open: boolean;
  onClose: () => void;
  fundName: string;
  fundDescription?: string | null;
  churchName: string;
  url: string;
};

/** Size of the export PNG canvas. */
const EXPORT_SIZE = 1024;

/** Matches public giving page — dark brand panel + trust green. */
const GIVING = {
  ink: "#101512",
  inkSoft: "#1c2420",
  paper: "#f5f5f2",
  paperMuted: "rgba(245, 245, 242, 0.55)",
  paperSoft: "rgba(245, 245, 242, 0.7)",
  trust: "#2f5a43",
  trustGlow: "rgba(47, 90, 67, 0.35)",
  qrDark: "#101512",
  qrLight: "#ffffff",
} as const;

async function buildExportPng(options: {
  url: string;
  fundName: string;
  fundDescription?: string | null;
  churchName: string;
}): Promise<Blob> {
  await document.fonts.ready.catch(() => undefined);

  const qrDataUrl = await QRCode.toDataURL(options.url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 560,
    color: {
      dark: GIVING.qrDark,
      light: GIVING.qrLight,
    },
  });

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponível.");
  }

  // Painel escuro = mesma tinta da página de contribuição
  ctx.fillStyle = GIVING.ink;
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  // Glow verde (igual ao bloom do GivingShell)
  const glow = ctx.createRadialGradient(
    EXPORT_SIZE * 0.78,
    EXPORT_SIZE * 0.28,
    40,
    EXPORT_SIZE * 0.78,
    EXPORT_SIZE * 0.28,
    420,
  );
  glow.addColorStop(0, GIVING.trustGlow);
  glow.addColorStop(1, "rgba(47, 90, 67, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  const pad = 72;
  const contentW = EXPORT_SIZE - pad * 2;
  let y = pad + 24;

  ctx.fillStyle = GIVING.paperMuted;
  ctx.font = "500 22px 'DM Sans', ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("CONTRIBUIÇÃO SEGURA", pad, y);
  y += 48;

  ctx.fillStyle = GIVING.paper;
  ctx.font = "700 48px Syne, 'DM Sans', ui-sans-serif, system-ui, sans-serif";
  const churchLines = wrapText(ctx, options.churchName, contentW, 2);
  for (const line of churchLines) {
    ctx.fillText(line, pad, y);
    y += 56;
  }

  y += 12;
  ctx.fillStyle = GIVING.trust;
  ctx.fillRect(pad, y, 72, 4);
  y += 40;

  ctx.fillStyle = GIVING.paper;
  ctx.font = "600 36px Syne, 'DM Sans', ui-sans-serif, system-ui, sans-serif";
  const fundLines = wrapText(ctx, options.fundName, contentW, 2);
  for (const line of fundLines) {
    ctx.fillText(line, pad, y);
    y += 44;
  }

  const description = options.fundDescription?.trim();
  if (description) {
    y += 10;
    ctx.fillStyle = GIVING.paperSoft;
    ctx.font = "400 22px 'DM Sans', ui-sans-serif, system-ui, sans-serif";
    const descLines = wrapText(ctx, description, contentW, 2);
    for (const line of descLines) {
      ctx.fillText(line, pad, y);
      y += 30;
    }
  }

  y += 8;
  ctx.fillStyle = GIVING.paperMuted;
  ctx.font = "500 20px 'DM Sans', ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Escaneie para contribuir", pad, y);

  const urlLabel = options.url.replace(/^https?:\/\//, "");
  const footerReserve = 88;
  const qrImg = await loadImage(qrDataUrl);
  const qrTop = y + 28;
  const qrMax = EXPORT_SIZE - footerReserve - qrTop - pad;
  const qrFrame = Math.min(440, Math.max(240, qrMax));
  const qrInner = Math.round(qrFrame * 0.88);
  const qrFrameX = (EXPORT_SIZE - qrFrame) / 2;
  const qrFrameY = qrTop;

  // Frame claro pro QR (precisa de contraste pra escanear)
  ctx.fillStyle = GIVING.paper;
  roundRect(ctx, qrFrameX, qrFrameY, qrFrame, qrFrame, 28);
  ctx.fill();

  const qrX = qrFrameX + (qrFrame - qrInner) / 2;
  const qrY = qrFrameY + (qrFrame - qrInner) / 2;
  ctx.drawImage(qrImg, qrX, qrY, qrInner, qrInner);

  ctx.fillStyle = GIVING.paperMuted;
  ctx.font = "400 17px ui-monospace, SFMono-Regular, Menlo, monospace";
  const urlDrawn = truncate(ctx, urlLabel, contentW);
  const urlWidth = ctx.measureText(urlDrawn).width;
  ctx.fillText(urlDrawn, (EXPORT_SIZE - urlWidth) / 2, EXPORT_SIZE - pad + 8);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Falha ao gerar PNG."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    lines.push(current);
    current = words[i]!;
    if (lines.length === maxLines - 1) {
      const rest = [current, ...words.slice(i + 1)].join(" ");
      lines.push(truncate(ctx, rest, maxWidth));
      return lines;
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines).map((line) => truncate(ctx, line, maxWidth));
}

function truncate(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar QR."));
    img.src = src;
  });
}

export function FundQrModal({
  open,
  onClose,
  fundName,
  fundDescription,
  churchName,
  url,
}: FundQrModalProps) {
  const titleId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"download" | "print" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ready = Boolean(previewUrl);
  const description = fundDescription?.trim() || null;

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setExportPreviewUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrlToRevoke: string | null = null;
    setPreviewUrl(null);
    setExportPreviewUrl(null);
    setError(null);

    void QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
      color: {
        dark: GIVING.qrDark,
        light: GIVING.qrLight,
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setPreviewUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Não foi possível gerar o QR code.");
        }
      });

    // Preview do cartão exportado (mesmo visual do PNG)
    void buildExportPng({ url, fundName, fundDescription: description, churchName })
      .then((blob) => {
        if (cancelled) {
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        objectUrlToRevoke = objectUrl;
        setExportPreviewUrl(objectUrl);
      })
      .catch(() => {
        // Preview do cartão é opcional; o QR simples ainda funciona.
      });

    return () => {
      cancelled = true;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [churchName, description, fundName, open, url]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose, open]);

  const handleDownload = useCallback(async () => {
    setBusy("download");
    setError(null);
    try {
      const blob = await buildExportPng({
        url,
        fundName,
        fundDescription: description,
        churchName,
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `qr-${slugifyFundQrFilename(fundName)}.png`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Não foi possível baixar a imagem.");
    } finally {
      setBusy(null);
    }
  }, [churchName, description, fundName, url]);

  const handlePrint = useCallback(async () => {
    setBusy("print");
    setError(null);
    try {
      const blob = await buildExportPng({
        url,
        fundName,
        fundDescription: description,
        churchName,
      });
      const objectUrl = URL.createObjectURL(blob);
      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) {
        URL.revokeObjectURL(objectUrl);
        setError("Permita pop-ups para imprimir o QR.");
        return;
      }
      printWindow.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>QR · ${fundName}</title>
  <style>
    @page { margin: 12mm; }
    html, body { margin: 0; background: #101512; }
    body { display: flex; min-height: 100vh; align-items: center; justify-content: center; }
    img { width: min(100%, 160mm); height: auto; }
  </style>
</head>
<body>
  <img src="${objectUrl}" alt="QR code de ${fundName}" />
  <script>
    const img = document.querySelector('img');
    img.onload = () => { window.focus(); window.print(); };
    window.onafterprint = () => window.close();
  </script>
</body>
</html>`);
      printWindow.document.close();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      setError("Não foi possível preparar a impressão.");
    } finally {
      setBusy(null);
    }
  }, [churchName, description, fundName, url]);

  if (!open) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          aria-label="Fechar"
          disabled={Boolean(busy)}
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-background shadow-popover sm:rounded-2xl",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-domain-finances-subtle/80 to-transparent"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-finances-subtle text-domain-finances-foreground">
                <QrCode className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2
                  id={titleId}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  QR code do fundo
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Para compartilhar ou imprimir
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onClose}
              disabled={Boolean(busy)}
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--giving-ink,#101512)]/20 bg-[#101512] shadow-xs">
              {exportPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob URL do canvas
                <img
                  src={exportPreviewUrl}
                  alt={`Cartão QR de ${fundName}`}
                  className="aspect-square w-full bg-[#101512] object-cover"
                />
              ) : (
                <div className="relative aspect-square w-full overflow-hidden bg-[#101512] px-5 py-6 text-[#f5f5f2]">
                  <div
                    className="pointer-events-none absolute -right-10 top-8 size-40 rounded-full bg-[#2f5a43]/35 blur-3xl"
                    aria-hidden
                  />
                  <div className="relative text-left">
                    <p className="text-[11px] font-medium tracking-wide text-[#f5f5f2]/55 uppercase">
                      Contribuição segura
                    </p>
                    <p className="font-display mt-4 text-xl font-bold tracking-tight">
                      {churchName}
                    </p>
                    <div
                      className="mt-4 h-px w-12 bg-[#2f5a43]"
                      aria-hidden
                    />
                    <p className="mt-4 text-base font-semibold tracking-tight">
                      {fundName}
                    </p>
                    {description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#f5f5f2]/70">
                        {description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[#f5f5f2]/55">
                      Escaneie para contribuir
                    </p>
                    <div className="mx-auto mt-5 flex size-[180px] items-center justify-center rounded-2xl bg-[#f5f5f2] p-2">
                      {!ready && !error ? (
                        <Loader2
                          className="size-6 animate-spin text-[#101512]/40"
                          aria-hidden
                        />
                      ) : null}
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- data URL gerado no cliente
                        <img
                          src={previewUrl}
                          alt={`QR code para ${fundName}`}
                          width={160}
                          height={160}
                          className="size-[160px] rounded-lg"
                        />
                      ) : null}
                    </div>
                    <p className="mt-3 break-all text-center font-mono text-[10px] leading-relaxed text-[#f5f5f2]/45">
                      {url.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error ? (
              <p className="mt-3 text-center text-sm text-destructive">{error}</p>
            ) : null}

            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Mesmo visual da página de contribuição — pronto para imprimir ou
              compartilhar.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={!ready || Boolean(busy)}
                onClick={() => void handleDownload()}
              >
                {busy === "download" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Baixar PNG
              </Button>
              <Button
                type="button"
                className="gap-2"
                disabled={!ready || Boolean(busy)}
                onClick={() => void handlePrint()}
              >
                {busy === "print" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Printer className="size-4" />
                )}
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
