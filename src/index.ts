export { defineAffiliateConfig } from './lib/config.ts';
export { resolveAffiliate } from './lib/resolve.ts';
export { buildChannelRewriteMap, rewriteAffiliateLinksForChannel } from './lib/channel-rewrite.ts';
export { resolveAffiliateCards } from './lib/affiliate-cards.ts';
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
export type {
  AffiliateCardDisplay,
  AffiliateCardEntry,
  ResolveAffiliateCardsInput,
} from './lib/affiliate-cards.ts';
