export { defineAffiliateConfig } from './lib/config.ts';
export { resolveAffiliate } from './lib/resolve.ts';
export { buildChannelRewriteMap, rewriteAffiliateLinksForChannel } from './lib/channel-rewrite.ts';
export { resolveAffiliateCards } from './lib/affiliate-cards.ts';
export { resolveDisclosures } from './lib/disclosures.ts';
export type {
  AffiliateConfig,
  AffiliateProgram,
  AffiliateProgramAmazon,
  AffiliateProgramLinks,
  CatalogEntry,
  CatalogEntryAmazon,
  CatalogEntryLink,
  ResolvedAffiliate,
} from './lib/types.ts';
export type { Localized } from './lib/i18n.ts';
export type {
  AffiliateCardDisplay,
  AffiliateCardEntry,
  ResolveAffiliateCardsInput,
} from './lib/affiliate-cards.ts';
