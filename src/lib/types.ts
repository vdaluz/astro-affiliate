/**
 * Amazon Associates program. `resolveAffiliate` constructs the manual-link URL
 * from `tag` and each item's ASIN: `https://www.amazon.com/dp/<ASIN>/ref=nosim?tag=<tag>`.
 */
export interface AffiliateProgramAmazon {
  kind: 'amazon';
  /** Associates tracking ID for this site, e.g. 'vdaluz-20'. */
  tag: string;
  /** FTC disclosure text rendered by <AffiliateDisclosure> for this program. */
  disclosure: string;
  /** item key -> ASIN */
  items: Record<string, string>;
}

/** A flat key -> URL program (Proton, AdGuard, future one-off referral links). */
export interface AffiliateProgramLinks {
  kind: 'links';
  disclosure: string;
  /** item key -> full URL */
  items: Record<string, string>;
}

export type AffiliateProgram = AffiliateProgramAmazon | AffiliateProgramLinks;

/**
 * Per-site affiliate catalog. Keyed by program name (e.g. 'amazon', 'proton',
 * 'adguard') - that name is also what posts declare in `affiliates:` frontmatter
 * and what `resolveAffiliate` expects as the prefix of a `program.itemKey` key.
 */
export interface AffiliateConfig {
  programs: Record<string, AffiliateProgram>;
}

export interface ResolvedAffiliate {
  url: string;
  /** Program name the key resolved under, e.g. 'amazon'. */
  program: string;
}
