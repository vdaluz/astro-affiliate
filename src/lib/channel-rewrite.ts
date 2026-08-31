import type { AffiliateConfig } from './types.ts';
import { resolveAffiliate } from './resolve.ts';

/**
 * Maps each catalog entry's default-resolved URL to its channel-specific URL,
 * for every entry where the channel actually differs from default. Markdown
 * `affiliate:key` links are resolved once at Astro build time via
 * `remarkAffiliate`, so a repost target (Medium, or any future channel) can't
 * get its own tag through a second compile - this map lets already-rendered
 * content be retargeted after the fact instead.
 *
 * Rendered HTML escapes `&` as `&amp;` in href attributes, so a default URL
 * with an ampersand (any URL with more than one query param) never matches
 * the raw map key in prerendered output. Add the HTML-escaped variant of
 * each such entry too, mapped to the escaped channel URL, so substitution
 * against real rendered HTML works regardless of query param count.
 */
export function buildChannelRewriteMap(config: AffiliateConfig, channel: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(config.catalog)) {
    const defaultResolved = resolveAffiliate(config, key);
    const channelResolved = resolveAffiliate(config, key, channel);
    if (defaultResolved.url !== channelResolved.url) {
      map[defaultResolved.url] = channelResolved.url;
      const escapedDefault = defaultResolved.url.replace(/&/g, '&amp;');
      if (escapedDefault !== defaultResolved.url) {
        map[escapedDefault] = channelResolved.url.replace(/&/g, '&amp;');
      }
    }
  }
  return map;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Rewrites already-rendered content (e.g. a prerendered post's HTML) to swap
 * default-channel affiliate URLs for a specific channel's URLs. Exact string
 * matching per catalog entry (each default URL escaped into a regex
 * alternative), not a generic regex over "tag=" or similar - safe against
 * matching unrelated content.
 *
 * A single regex pass, not one split/join per entry: sequential passes
 * re-scan each other's output, so a shorter default URL that happens to be a
 * prefix of another entry's default OR channel URL would corrupt an already-
 * rewritten result on a later pass. One pass never re-scans a replacement.
 * Alternatives are ordered longest-first because regex alternation is
 * first-match-wins at a given position, not longest-match-wins - without the
 * ordering a shorter prefix could still win the match before the longer
 * alternative gets a chance.
 */
export function rewriteAffiliateLinksForChannel(content: string, config: AffiliateConfig, channel: string): string {
  const map = buildChannelRewriteMap(config, channel);
  const defaultUrls = Object.keys(map).sort((a, b) => b.length - a.length);
  if (defaultUrls.length === 0) return content;
  const pattern = new RegExp(defaultUrls.map(escapeRegExp).join('|'), 'g');
  return content.replace(pattern, (matched) => map[matched]);
}
