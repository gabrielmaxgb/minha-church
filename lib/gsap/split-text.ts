/** DIY SplitText (Club plugin not required). Prefer words for headlines. */

export type SplitMode = "words" | "chars";

export interface SplitResult {
  elements: HTMLElement[];
  revert: () => void;
}

function wrapToken(
  token: string,
  className: string,
): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement("span");
  outer.className = `${className}-outer`;
  outer.style.display = "inline-block";
  outer.style.overflow = "hidden";
  outer.style.verticalAlign = "bottom";
  outer.setAttribute("aria-hidden", "true");

  const inner = document.createElement("span");
  inner.className = className;
  inner.style.display = "inline-block";
  inner.style.willChange = "transform, opacity";
  inner.textContent = token;
  outer.appendChild(inner);

  return { outer, inner };
}

/** Split element text into word or char inners (mask-ready). Restores on revert. */
export function splitText(
  el: HTMLElement,
  mode: SplitMode = "words",
): SplitResult {
  const original = el.textContent ?? "";
  el.setAttribute("aria-label", original.trim());
  el.textContent = "";

  const elements: HTMLElement[] = [];

  if (mode === "words") {
    const parts = original.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(part));
        continue;
      }
      const { outer, inner } = wrapToken(part, "gsap-word");
      el.appendChild(outer);
      elements.push(inner);
    }
  } else {
    for (const char of original) {
      if (char === " ") {
        el.appendChild(document.createTextNode(" "));
        continue;
      }
      if (char === "\n") {
        el.appendChild(document.createElement("br"));
        continue;
      }
      const { outer, inner } = wrapToken(char, "gsap-char");
      el.appendChild(outer);
      elements.push(inner);
    }
  }

  return {
    elements,
    revert: () => {
      el.textContent = original;
      el.removeAttribute("aria-label");
    },
  };
}
