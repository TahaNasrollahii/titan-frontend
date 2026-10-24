const DESCRIPTION_MIN = 110;
const DESCRIPTION_MAX = 158;

function clean(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Builds a meta description of search-snippet length: short admin/product copy is
 * topped up with the given fallback sentences, long copy is cut on a word boundary.
 */
export function composeMetaDescription(
  primary: string | null | undefined,
  ...fallbacks: string[]
): string {
  let text = clean(primary || '');

  for (const fallback of fallbacks) {
    if (text.length >= DESCRIPTION_MIN) break;
    const extra = clean(fallback);
    if (!extra || text.includes(extra)) continue;
    text = text ? `${text.replace(/[.،؛!؟\s]+$/u, '')}. ${extra}` : extra;
  }

  if (text.length <= DESCRIPTION_MAX) return text;

  const cut = text.slice(0, DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > DESCRIPTION_MIN ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s.،؛,:–—-]+$/u, '')}…`;
}
