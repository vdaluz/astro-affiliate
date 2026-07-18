import type { Localized } from './i18n.ts';

/**
 * Amazon Associates program. `resolveAffiliate` constructs the manual-link URL
 * from `tag` and a catalog entry's ASIN: `https://www.amazon.com/dp/<ASIN>/ref=nosim?tag=<tag>`.
 */
export interface AffiliateProgramAmazon {
  kind: 'amazon';
  /** Associates tracking ID for this site, e.g. 'vdaluz-20'. */
  tag: string;
  /**
   * Optional per-channel tracking ID overrides (e.g. `{ medium: 'vdaluz-medium-20' }`
   * for a distinct tag on Medium reposts). A channel not listed here falls back to `tag`.
   */
  channelTags?: Record<string, string>;
  /** FTC disclosure text rendered by <AffiliateDisclosure> for this program. */
  disclosure: Localized;
}

/** A flat link-key -> URL program (Proton, AdGuard, future one-off referral links). */
export interface AffiliateProgramLinks {
  kind: 'links';
  disclosure: Localized;
  links: Record<string, string>;
  /**
   * Optional per-channel URL overrides, keyed by channel then link key. A
   * channel/link-key combination not listed here falls back to `links`.
   */
  channelLinks?: Record<string, Record<string, string>>;
}

export type AffiliateProgram = AffiliateProgramAmazon | AffiliateProgramLinks;

export interface CatalogEntryAmazon {
  /** Name of a 'amazon'-kind program in `programs`. */
  program: string;
  asin: string;
  /** Free-form grouping for site-side filtering (e.g. a /gear page), not used by resolution. */
  category?: string;
}

export interface CatalogEntryLink {
  /** Name of a 'links'-kind program in `programs`. */
  program: string;
  /** Key into that program's `links` map. */
  link: string;
  /** Free-form grouping for site-side filtering (e.g. a /gear page), not used by resolution. */
  category?: string;
}

export type CatalogEntry = CatalogEntryAmazon | CatalogEntryLink;

/**
 * Per-site affiliate config. `programs` holds disclosure text and per-program
 * resolution settings (site tag, or a link map); `catalog` is a single flat,
 * unprefixed-key list of every item, each pointing at the program that resolves
 * it. Catalog keys are what posts use in `affiliate:key` markdown links and
 * what `resolveAffiliate`/`<AffiliateLink>` expect.
 */
export interface AffiliateConfig {
  programs: Record<string, AffiliateProgram>;
  catalog: Record<string, CatalogEntry>;
}

export interface ResolvedAffiliate {
  url: string;
  /** Program name the key resolved under, e.g. 'amazon'. */
  program: string;
}
