import Papa from "papaparse";
import * as XLSX from "xlsx";

import type { MemberStatus } from "@/types/members";

/** Campos suportados na importação (espelham o CreateMemberDto do backend). */
export type ImportFieldKey =
  | "name"
  | "email"
  | "cpf"
  | "phone"
  | "phoneSecondary"
  | "birthDate"
  | "gender"
  | "maritalStatus"
  | "weddingAnniversary"
  | "street"
  | "number"
  | "complement"
  | "neighborhood"
  | "city"
  | "state"
  | "zipCode"
  | "status"
  | "visitorSince"
  | "baptismDate"
  | "membershipDate";

export interface ImportField {
  key: ImportFieldKey;
  /** Cabeçalho usado no modelo baixável. */
  label: string;
  /** Cabeçalhos alternativos (normalizados) reconhecidos no auto-mapeamento. */
  aliases: string[];
  required?: boolean;
  example: string;
}

/** Normaliza um cabeçalho para comparação: sem acento, minúsculo, sem pontuação. */
export function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const IMPORT_FIELDS: ImportField[] = [
  {
    key: "name",
    label: "Nome",
    aliases: ["nome completo", "nome do membro", "membro", "pessoa"],
    required: true,
    example: "Maria Souza",
  },
  {
    key: "email",
    label: "E-mail",
    aliases: ["email", "correio", "e mail"],
    example: "maria@email.com",
  },
  { key: "cpf", label: "CPF", aliases: ["documento"], example: "123.456.789-09" },
  {
    key: "phone",
    label: "Telefone",
    aliases: ["celular", "whatsapp", "fone", "tel", "contato"],
    example: "(11) 99999-0000",
  },
  {
    key: "phoneSecondary",
    label: "Telefone 2",
    aliases: ["telefone secundario", "celular 2", "outro telefone", "telefone 2"],
    example: "",
  },
  {
    key: "birthDate",
    label: "Nascimento",
    aliases: ["data de nascimento", "aniversario", "dt nascimento", "nasc"],
    example: "20/05/1990",
  },
  { key: "gender", label: "Sexo", aliases: ["genero"], example: "feminino" },
  {
    key: "maritalStatus",
    label: "Estado civil",
    aliases: ["estado civil", "civil"],
    example: "casado",
  },
  {
    key: "weddingAnniversary",
    label: "Aniversário de casamento",
    aliases: ["bodas", "data de casamento", "aniversario de casamento"],
    example: "",
  },
  {
    key: "street",
    label: "Rua",
    aliases: ["logradouro", "endereco", "rua"],
    example: "Rua das Flores",
  },
  { key: "number", label: "Número", aliases: ["numero", "num"], example: "100" },
  {
    key: "complement",
    label: "Complemento",
    aliases: ["apto", "apartamento", "complemento"],
    example: "Apto 12",
  },
  { key: "neighborhood", label: "Bairro", aliases: ["bairro"], example: "Centro" },
  { key: "city", label: "Cidade", aliases: ["municipio"], example: "São Paulo" },
  { key: "state", label: "UF", aliases: ["estado", "uf"], example: "SP" },
  { key: "zipCode", label: "CEP", aliases: ["cep"], example: "01000-000" },
  {
    key: "status",
    label: "Situação",
    aliases: ["situacao", "status", "tipo", "categoria"],
    // Exemplo propositalmente "visitante": subir o modelo sem editar não deve
    // criar um membro ativo (que provisiona login e conta para o plano).
    example: "visitante",
  },
  {
    key: "visitorSince",
    label: "Visita desde",
    aliases: ["primeira visita", "visitante desde", "visita desde"],
    example: "",
  },
  {
    key: "baptismDate",
    label: "Batismo",
    aliases: ["data de batismo", "batizado em", "batismo"],
    example: "01/12/2015",
  },
  {
    key: "membershipDate",
    label: "Membro desde",
    aliases: ["data de membresia", "membresia", "data de admissao", "membro desde"],
    example: "10/01/2016",
  },
];

const FIELD_BY_KEY = new Map<ImportFieldKey, ImportField>(
  IMPORT_FIELDS.map((field) => [field.key, field]),
);

export function importFieldLabel(key: ImportFieldKey): string {
  return FIELD_BY_KEY.get(key)?.label ?? key;
}

/** Uma linha bruta pronta pra enviar ao backend (chaves = campos do DTO). */
export type ImportMemberRow = Partial<Record<ImportFieldKey, string>>;

export interface MemberImportRowResult {
  index: number;
  name: string | null;
  outcome: "valid" | "created" | "error";
  status: MemberStatus | null;
  reason?: string;
}

export interface ImportMembersResult {
  dryRun: boolean;
  total: number;
  created: number;
  errors: number;
  activeCount: number;
  results: MemberImportRowResult[];
}

export interface ImportMembersRequest {
  rows: ImportMemberRow[];
  dryRun?: boolean;
}

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

function toCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return formatDateCell(value);
  }
  return String(value).trim();
}

function formatDateCell(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

function rowsToSheet(data: unknown[][]): ParsedSheet {
  const normalized = data
    .map((row) => (Array.isArray(row) ? row.map(toCell) : []))
    .filter((row) => row.some((cell) => cell !== ""));

  if (normalized.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = normalized[0];
  const rows = normalized
    .slice(1)
    .map((row) => headers.map((_, index) => row[index] ?? ""));

  return { headers, rows };
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const name = file.name.toLowerCase();
  const isCsv =
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/csv";

  if (isCsv) {
    return parseCsv(file);
  }

  return parseXlsx(file);
}

function parseCsv(file: File): Promise<ParsedSheet> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: "greedy",
      complete: (result) => resolve(rowsToSheet(result.data as unknown[][])),
      error: (error) => reject(error),
    });
  });
}

async function parseXlsx(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }
  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  return rowsToSheet(data);
}

/** Auto-mapeia cada coluna da planilha para um campo (ou null se não reconhecida). */
export function autoMapColumns(headers: string[]): (ImportFieldKey | null)[] {
  const used = new Set<ImportFieldKey>();

  return headers.map((header) => {
    const normalized = normalizeHeader(header);
    if (!normalized) {
      return null;
    }

    const match = IMPORT_FIELDS.find(
      (field) =>
        !used.has(field.key) &&
        (normalizeHeader(field.label) === normalized ||
          field.aliases.includes(normalized)),
    );

    if (match) {
      used.add(match.key);
      return match.key;
    }
    return null;
  });
}

export interface BuiltImportRows {
  rows: ImportMemberRow[];
  /** Nº da linha na planilha (cabeçalho = 1) de cada linha em `rows`, alinhado por índice. */
  lines: number[];
}

/**
 * Monta as linhas prontas para envio, a partir do mapeamento de colunas.
 * Linhas totalmente vazias (sem nenhum dado além do status padrão) são descartadas.
 * Mantém o número da linha original da planilha para mensagens de erro precisas.
 */
export function buildImportRows(
  sheet: ParsedSheet,
  mapping: (ImportFieldKey | null)[],
  defaultStatus: MemberStatus,
): BuiltImportRows {
  const rows: ImportMemberRow[] = [];
  const lines: number[] = [];

  sheet.rows.forEach((cells, rowIndex) => {
    const row: ImportMemberRow = {};
    let hasData = false;

    mapping.forEach((key, index) => {
      if (!key) {
        return;
      }
      const value = cells[index]?.trim();
      if (value) {
        row[key] = value;
        hasData = true;
      }
    });

    if (!hasData) {
      return;
    }

    if (!row.status) {
      row.status = defaultStatus;
    }

    rows.push(row);
    // rowIndex 0 = primeira linha de dados = linha 2 da planilha (linha 1 = cabeçalho).
    lines.push(rowIndex + 2);
  });

  return { rows, lines };
}

function templateHeaders(): string[] {
  return IMPORT_FIELDS.map((field) => field.label);
}

function templateExampleRow(): string[] {
  return IMPORT_FIELDS.map((field) => field.example);
}

const TEMPLATE_HELP_ROWS: string[][] = [
  ["Coluna", "Obrigatória?", "Valores aceitos / formato"],
  ["Nome", "Sim", "Texto com no mínimo 2 letras"],
  ["E-mail", "Não*", "exemplo@email.com"],
  ["CPF", "Não*", "000.000.000-00"],
  ["Situação", "Não (padrão: visitante)", "visitante, ativo ou inativo"],
  ["Sexo", "Não", "masculino ou feminino"],
  ["Estado civil", "Não", "solteiro, casado, divorciado ou viúvo"],
  ["Datas", "Não", "DD/MM/AAAA (ex.: 20/05/1990). Também aceita AAAA-MM-DD"],
  ["UF", "Não", "2 letras (ex.: SP)"],
  ["CEP", "Não", "8 dígitos"],
  ["", "", ""],
  [
    "* Membro ativo",
    "",
    "Precisa de e-mail OU CPF (é o login de acesso). Ativos contam para o plano; visitantes não.",
  ],
];

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadTemplateCsv(): void {
  const csv = Papa.unparse([templateHeaders(), templateExampleRow()]);
  // BOM (\uFEFF) garante acentuação correta ao abrir no Excel.
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, "modelo-membros-minhachurch.csv");
}

export function downloadTemplateXlsx(): void {
  const members = XLSX.utils.aoa_to_sheet([
    templateHeaders(),
    templateExampleRow(),
  ]);
  const help = XLSX.utils.aoa_to_sheet(TEMPLATE_HELP_ROWS);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, members, "Membros");
  XLSX.utils.book_append_sheet(workbook, help, "Instruções");

  const output = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, "modelo-membros-minhachurch.xlsx");
}
