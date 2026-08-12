export interface AffiliateCardDisplay {
  name: string;
  blurb: string;
  /** Root-relative image path. Optional - a card with no image just renders without one. */
  image?: string;
  postCategories?: string[];
}

export interface AffiliateCardEntry {
  key: string;
  display: AffiliateCardDisplay;
}

export interface ResolveAffiliateCardsInput {
  /** The post's own affiliate:key links, in document order (see remarkAffiliate's affiliateKeys). */
  postKeys: string[];
  postCategory: string;
  /** Locale-independent post identifier - seeds the deterministic shuffle so a
   * post shows the same cards on every rebuild and in every locale, while
   * different posts land on different combinations. */
  postSlug: string;
  /** Display data for every catalog key eligible to appear as a card, keyed
   * by the same catalog key used in the consumer's affiliate.ts. Required,
   * not defaulted - this package stays data-free by design (see AST-36's
   * cancellation for why a shared package should never bake in a consumer's
   * own catalog/display data). */
  display: Record<string, AffiliateCardDisplay>;
  /** Always-eligible last-resort fill tier, as catalog keys into `display`. */
  generic: string[];
}

const MAX_CARDS = 3;

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 - small deterministic PRNG seeded from a 32-bit int. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Resolves exactly up to MAX_CARDS entries for a post, in priority order:
 *
 * 1. The post's own inline links, in document order (first MAX_CARDS if it has
 *    more than that) - never randomized, these are real editorial choices.
 * 2. Category-matched catalog items, shuffled with a PRNG seeded from postSlug,
 *    filling every remaining slot except the last one.
 * 3. The last remaining slot: any category-matched items left over from (2) plus
 *    the generic always-eligible defaults, pooled together and shuffled with the
 *    same seeded PRNG. This applies even when the category pool alone could have
 *    filled every remaining slot - a category with several matches still yields
 *    a generic default in the mix sometimes, by design.
 *
 * Deduplicates by catalog key across all tiers, so a post inlining a key that's
 * also a category match or generic default only shows it once.
 *
 * The shuffle is deterministic per postSlug: the same post always resolves to
 * the same card set across rebuilds and locales, but different posts in the
 * same category land on different combinations.
 *
 * Side-effect-free and consumer-config-free by design - the piece meant to be
 * shared across every site that wants this behavior, with display/generic
 * data supplied by each consumer's own config.
 */
export function resolveAffiliateCards({
  postKeys,
  postCategory,
  postSlug,
  display,
  generic,
}: ResolveAffiliateCardsInput): AffiliateCardEntry[] {
  const seen = new Set<string>();
  const result: AffiliateCardEntry[] = [];
  const rng = mulberry32(hashString(postSlug));

  function tryAdd(key: string) {
    if (result.length >= MAX_CARDS || seen.has(key)) return;
    const entry = display[key];
    if (!entry) return;
    seen.add(key);
    result.push({ key, display: entry });
  }

  for (const key of postKeys) {
    if (result.length >= MAX_CARDS) break;
    tryAdd(key);
  }

  if (result.length < MAX_CARDS) {
    const categoryCandidates = shuffle(
      Object.entries(display)
        .filter(([key, entry]) => !seen.has(key) && entry.postCategories?.includes(postCategory))
        .map(([key]) => key),
      rng
    );

    const slotsRemaining = MAX_CARDS - result.length;
    const categoryOnlySlots = Math.max(0, slotsRemaining - 1);
    for (const key of categoryCandidates.slice(0, categoryOnlySlots)) tryAdd(key);

    if (result.length < MAX_CARDS) {
      const leftoverCategoryCandidates = categoryCandidates.slice(categoryOnlySlots);
      const genericCandidates = generic.filter((key) => !seen.has(key));
      const finalPool = shuffle([...leftoverCategoryCandidates, ...genericCandidates], rng);
      for (const key of finalPool) {
        if (result.length >= MAX_CARDS) break;
        tryAdd(key);
      }
    }
  }

  return result;
}
