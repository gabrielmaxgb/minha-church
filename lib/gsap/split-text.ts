/**
 * DIY word split for mask / scrub reveals (no Club SplitText).
 * Each word is wrapped: .gsap-line > .gsap-word
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent?.trim() ?? "";
  if (!text) {
    return [];
  }

  el.setAttribute("aria-label", text);
  el.textContent = "";

  const words = text.split(/\s+/);
  const wordEls: HTMLElement[] = [];

  words.forEach((word, index) => {
    const line = document.createElement("span");
    line.className = "gsap-line inline-block overflow-hidden align-bottom";
    line.setAttribute("aria-hidden", "true");

    const inner = document.createElement("span");
    inner.className = "gsap-word inline-block will-change-transform";
    inner.textContent = word;
    line.appendChild(inner);
    el.appendChild(line);

    if (index < words.length - 1) {
      el.appendChild(document.createTextNode(" "));
    }

    wordEls.push(inner);
  });

  return wordEls;
}

/** Restore plain text (e.g. before remount / reduced-motion path). */
export function unsplitText(el: HTMLElement) {
  const label = el.getAttribute("aria-label");
  if (label) {
    el.textContent = label;
    el.removeAttribute("aria-label");
  }
}
