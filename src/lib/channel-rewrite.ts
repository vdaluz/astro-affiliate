import type { AffiliateConfig } from './types.ts';
import { resolveAffiliate } from './resolve.ts';

/**
 * Maps each catalog entry's default-resolved URL to its channel-specific URL,
 * for every entry where the channel actually differs from default. Markdown
 * `affiliate:key` links are resolved once at Astro build time via
 * `remarkAffiliate`, so a repost target (Medium, or any future channel) can't
 * get its own tag through a second compile - this map lets already-rendered
 * content be retargeted after the fact instead.
 */
export function buildChannelRewriteMap(config: AffiliateConfig, channel: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(config.catalog)) {
    const defaultResolved = resolveAffiliate(config, key);
    const channelResolved = resolveAffiliate(config, key, channel);
    if (defaultResolved.url !== channelResolved.url) {
      map[defaultResolved.url] = channelResolved.url;
    }
  }
  return map;
}

/**
 * Rewrites already-rendered content (e.g. a prerendered post's HTML) to swap
 * default-channel affiliate URLs for a specific channel's URLs. Exact
 * string replacement per catalog entry, not a generic regex over "tag=" or
 * similar - safe against matching unrelated content.
 */
export function rewriteAffiliateLinksForChannel(content: string, config: AffiliateConfig, channel: string): string {
  const map = buildChannelRewriteMap(config, channel);
  return Object.entries(map).reduce(
    (result, [defaultUrl, channelUrl]) => result.split(defaultUrl).join(channelUrl),
    content
  );
}
