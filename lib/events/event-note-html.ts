import DOMPurify from "isomorphic-dompurify";

const NOTE_HTML_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
] as const;

/** Sanitiza HTML das notas do evento (FE). */
export function sanitizeEventNoteHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...NOTE_HTML_TAGS],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/** True se não há texto visível (ignora tags vazias). */
export function isEventNoteBodyEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

export function emptyEventNoteHtml(): string {
  return "<p></p>";
}
