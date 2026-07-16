"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import { TierCrossingModal } from "@/components/billing/tier-crossing-modal";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  confirmTierCrossing,
  fetchTierCrossingPreview,
  requestTierCrossing,
  type TierCrossingPreview,
} from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { importMembers } from "@/lib/api/queries/members.keys";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { membersKeys } from "@/lib/api/queries";
import {
  autoMapColumns,
  buildImportRows,
  downloadTemplateCsv,
  downloadTemplateXlsx,
  IMPORT_FIELDS,
  parseSpreadsheet,
  type ImportFieldKey,
  type ImportMembersResult,
  type ParsedSheet,
} from "@/lib/members/import";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { MEMBER_STATUS_LABELS, type MemberStatus } from "@/types/members";

type Step = "upload" | "map" | "preview" | "done";

interface ImportMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

const IGNORE_VALUE = "__ignore__";

export function ImportMembersDialog({ open, onClose }: ImportMembersDialogProps) {
  const { church, user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = Boolean(user?.isOwner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<(ImportFieldKey | null)[]>([]);
  const [defaultStatus, setDefaultStatus] = useState<MemberStatus>("visitor");
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [dryResult, setDryResult] = useState<ImportMembersResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [finalResult, setFinalResult] = useState<ImportMembersResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Estado do modal de mudança de faixa (tier crossing).
  const [tierPreview, setTierPreview] = useState<TierCrossingPreview | null>(
    null,
  );
  const [tierLoading, setTierLoading] = useState(false);
  const [tierError, setTierError] = useState<string | null>(null);
  const [tierRequestSent, setTierRequestSent] = useState(false);

  const reset = useCallback(() => {
    setStep("upload");
    setFileName("");
    setSheet(null);
    setMapping([]);
    setDefaultStatus("visitor");
    setParsing(false);
    setDragging(false);
    setDryResult(null);
    setValidating(false);
    setImporting(false);
    setFinalResult(null);
    setError(null);
    setTierPreview(null);
    setTierLoading(false);
    setTierError(null);
    setTierRequestSent(false);
  }, []);

  const handleClose = useCallback(() => {
    if (importing || validating || parsing) {
      return;
    }
    onClose();
    // Pequeno atraso deixa a animação de saída antes de limpar.
    setTimeout(reset, 200);
  }, [importing, validating, parsing, onClose, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleClose]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setParsing(true);
    try {
      const parsed = await parseSpreadsheet(file);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError(
          "A planilha parece vazia. Confira se a primeira linha tem os títulos das colunas e se há pelo menos uma pessoa.",
        );
        setParsing(false);
        return;
      }
      setFileName(file.name);
      setSheet(parsed);
      setMapping(autoMapColumns(parsed.headers));
      setDryResult(null);
      setStep("map");
    } catch {
      setError(
        "Não consegui ler este arquivo. Use um CSV ou Excel (.xlsx) — de preferência o modelo.",
      );
    } finally {
      setParsing(false);
    }
  }, []);

  const nameMapped = useMemo(
    () => mapping.some((key) => key === "name"),
    [mapping],
  );

  const built = useMemo(() => {
    if (!sheet) {
      return null;
    }
    return buildImportRows(sheet, mapping, defaultStatus);
  }, [sheet, mapping, defaultStatus]);

  const handleValidate = useCallback(async () => {
    if (!church?.id || !built || built.rows.length === 0) {
      return;
    }
    setError(null);
    setValidating(true);
    try {
      const result = await importMembers(church.id, {
        rows: built.rows,
        dryRun: true,
      });
      setDryResult(result);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível validar a planilha. Tente novamente.",
      );
    } finally {
      setValidating(false);
    }
  }, [church, built]);

  const runImport = useCallback(async () => {
    if (!church?.id || !built) {
      return;
    }
    setImporting(true);
    setError(null);
    setTierPreview(null);
    try {
      const result = await importMembers(church.id, {
        rows: built.rows,
        dryRun: false,
      });
      setFinalResult(result);
      setStep("done");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: membersKeys._def }),
        queryClient.invalidateQueries({ queryKey: billingKeys._def }),
      ]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir a importação.",
      );
    } finally {
      setImporting(false);
    }
  }, [church, built, queryClient]);

  const validActiveCount = useMemo(() => {
    if (!dryResult) {
      return 0;
    }
    return dryResult.results.filter(
      (row) => row.outcome === "valid" && row.status === "active",
    ).length;
  }, [dryResult]);

  const currentActiveMembers = church?.memberCount ?? 0;

  const handleStartImport = useCallback(async () => {
    if (!church?.id) {
      return;
    }

    // Sem ativos novos → nenhuma faixa de plano é afetada. Importa direto.
    if (validActiveCount === 0) {
      await runImport();
      return;
    }

    setImporting(true);
    setError(null);
    try {
      const projected = currentActiveMembers + validActiveCount;
      const preview = await fetchTierCrossingPreview(church.id, projected);
      if (!preview.crossesTier) {
        await runImport();
        return;
      }
      // Cruza faixa: pede confirmação (dono) ou autorização (equipe) antes de rodar.
      setImporting(false);
      setTierRequestSent(false);
      setTierError(null);
      setTierPreview(preview);
    } catch (err) {
      setImporting(false);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível verificar a faixa do plano.",
      );
    }
  }, [church, validActiveCount, currentActiveMembers, runImport]);

  const handleTierConfirm = useCallback(async () => {
    if (!church?.id || !tierPreview || !isOwner) {
      return;
    }
    setTierLoading(true);
    setTierError(null);
    try {
      await confirmTierCrossing(church.id, tierPreview.projectedTierId);
      setTierPreview(null);
      await runImport();
    } catch (err) {
      setTierError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível confirmar a nova faixa.",
      );
    } finally {
      setTierLoading(false);
    }
  }, [church, tierPreview, isOwner, runImport]);

  const handleTierRequest = useCallback(async () => {
    if (!church?.id || !tierPreview) {
      return;
    }
    setTierLoading(true);
    setTierError(null);
    try {
      await requestTierCrossing(church.id, tierPreview.projectedTierId);
      setTierRequestSent(true);
      await queryClient.invalidateQueries({ queryKey: billingKeys._def });
    } catch (err) {
      setTierError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível avisar o proprietário.",
      );
    } finally {
      setTierLoading(false);
    }
  }, [church, tierPreview, queryClient]);

  if (!open) {
    return null;
  }

  const validCount = dryResult ? dryResult.total - dryResult.errors : 0;
  const errorResults = dryResult
    ? dryResult.results.filter((row) => row.outcome === "error")
    : [];
  const finalErrors = finalResult
    ? finalResult.results.filter((row) => row.outcome === "error")
    : [];
  const lineOf = (index: number) => built?.lines[index] ?? index + 2;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar importação"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Importar membros por planilha"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <header className="flex items-start gap-4 border-b border-border px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-attention-mark text-attention-foreground">
            <FileSpreadsheet className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              Importar membros por planilha
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === "upload" &&
                "Baixe o modelo, preencha e envie. Cuidamos do resto."}
              {step === "map" &&
                "Confira se cada coluna caiu no campo certo."}
              {step === "preview" &&
                "Revise o que será importado antes de confirmar."}
              {step === "done" && "Importação concluída."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium">1. Baixe o modelo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Já vem com as colunas certas e um exemplo. É o jeito mais
                  seguro de acertar de primeira.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplateXlsx}
                  >
                    <Download className="size-4" />
                    Modelo Excel (.xlsx)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplateCsv}
                  >
                    <Download className="size-4" />
                    Modelo CSV
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  2. Envie a planilha preenchida
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    const file = event.dataTransfer.files?.[0];
                    if (file) {
                      void handleFile(file);
                    }
                  }}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
                    dragging
                      ? "border-signal bg-attention-subtle"
                      : "border-border hover:border-foreground/40 hover:bg-muted/30",
                  )}
                >
                  {parsing ? (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                    <UploadCloud className="size-6 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {parsing
                      ? "Lendo a planilha..."
                      : "Clique para escolher ou arraste o arquivo aqui"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    CSV, XLSX ou XLS
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleFile(file);
                    }
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          )}

          {step === "map" && sheet && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{fileName}</span>{" "}
                · {sheet.rows.length}{" "}
                {sheet.rows.length === 1 ? "linha" : "linhas"} detectadas
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Colunas da sua planilha</p>
                <div className="overflow-hidden rounded-xl border border-border">
                  {sheet.headers.map((header, index) => (
                    <div
                      key={`${header}-${index}`}
                      className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {header || `Coluna ${index + 1}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          ex.: {sheet.rows[0]?.[index] || "—"}
                        </p>
                      </div>
                      <SelectField
                        aria-label={`Campo para a coluna ${header}`}
                        value={mapping[index] ?? IGNORE_VALUE}
                        onChange={(event) => {
                          const value = event.target.value;
                          setMapping((current) => {
                            const next = [...current];
                            next[index] =
                              value === IGNORE_VALUE
                                ? null
                                : (value as ImportFieldKey);
                            return next;
                          });
                          setDryResult(null);
                        }}
                        className="w-full sm:w-56"
                      >
                        <option value={IGNORE_VALUE}>Ignorar coluna</option>
                        {IMPORT_FIELDS.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                            {field.required ? " (obrigatório)" : ""}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  ))}
                </div>
                {!nameMapped && (
                  <p className="text-xs text-destructive">
                    Aponte qual coluna é o <strong>Nome</strong> para continuar.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Situação padrão
                  <span className="ml-1 font-normal text-muted-foreground">
                    (para quem não tem a coluna &ldquo;Situação&rdquo; preenchida)
                  </span>
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["visitor", "active", "inactive"] as MemberStatus[]).map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setDefaultStatus(value);
                          setDryResult(null);
                        }}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-sm transition-colors",
                          defaultStatus === value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {MEMBER_STATUS_LABELS[value]}
                      </button>
                    ),
                  )}
                </div>
                {defaultStatus === "active" && (
                  <p className="text-xs text-muted-foreground">
                    Membros ativos ganham acesso ao app e contam para o plano.
                    Cada um precisa de e-mail ou CPF.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "preview" && dryResult && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <p className="text-2xl font-semibold tabular-nums">
                    {validCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {validCount === 1
                      ? "pessoa pronta para importar"
                      : "pessoas prontas para importar"}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    dryResult.errors > 0
                      ? "border-attention-border bg-attention-subtle"
                      : "border-border bg-muted/20",
                  )}
                >
                  <p className="text-2xl font-semibold tabular-nums">
                    {dryResult.errors}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dryResult.errors === 1
                      ? "linha será ignorada"
                      : "linhas serão ignoradas"}
                  </p>
                </div>
              </div>

              {validActiveCount > 0 && (
                <p className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {validActiveCount}{" "}
                  {validActiveCount === 1
                    ? "membro ativo será cadastrado e contará"
                    : "membros ativos serão cadastrados e contarão"}{" "}
                  para o plano. Se isso mudar sua faixa, pediremos confirmação
                  antes.
                </p>
              )}

              {errorResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Linhas com problema{" "}
                    <span className="font-normal text-muted-foreground">
                      (serão puladas)
                    </span>
                  </p>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
                    {errorResults.map((row) => (
                      <div
                        key={row.index}
                        className="flex items-start gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                          Linha {lineOf(row.index)}
                        </span>
                        <div className="min-w-0">
                          {row.name && (
                            <p className="truncate font-medium">{row.name}</p>
                          )}
                          <p className="text-muted-foreground">{row.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "done" && finalResult && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-attention-subtle text-attention-foreground">
                  <CheckCircle2 className="size-7" aria-hidden />
                </div>
                <p className="text-lg font-semibold">
                  {finalResult.created}{" "}
                  {finalResult.created === 1
                    ? "pessoa importada"
                    : "pessoas importadas"}
                </p>
                {finalResult.errors > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {finalResult.errors}{" "}
                    {finalResult.errors === 1
                      ? "linha foi ignorada"
                      : "linhas foram ignoradas"}
                  </p>
                )}
              </div>

              {finalErrors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Linhas ignoradas</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                    {finalErrors.map((row) => (
                      <div
                        key={row.index}
                        className="flex items-start gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                          Linha {lineOf(row.index)}
                        </span>
                        <div className="min-w-0">
                          {row.name && (
                            <p className="truncate font-medium">{row.name}</p>
                          )}
                          <p className="text-muted-foreground">{row.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          {step === "map" && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("upload");
                  setSheet(null);
                }}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="cta"
                onClick={() => void handleValidate()}
                disabled={!nameMapped || validating || !built?.rows.length}
              >
                {validating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Validar planilha"
                )}
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("map")}
                disabled={importing}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="cta"
                onClick={() => void handleStartImport()}
                disabled={validCount === 0 || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  `Importar ${validCount} ${validCount === 1 ? "pessoa" : "pessoas"}`
                )}
              </Button>
            </>
          )}

          {step === "done" && (
            <Button
              type="button"
              variant="cta"
              className="ml-auto"
              onClick={handleClose}
            >
              Concluir
            </Button>
          )}

          {step === "upload" && (
            <Button
              type="button"
              variant="ghost"
              className="ml-auto"
              onClick={handleClose}
            >
              Cancelar
            </Button>
          )}
        </footer>
      </div>

      {tierPreview && (
        <TierCrossingModal
          open
          preview={tierPreview}
          mode={isOwner ? "owner-confirm" : "request-owner"}
          loading={tierLoading}
          error={tierError}
          requestSent={tierRequestSent}
          onConfirm={() => void handleTierConfirm()}
          onRequestOwner={() => void handleTierRequest()}
          onClose={() => {
            setTierPreview(null);
            setTierError(null);
          }}
        />
      )}
    </div>
  );
}
