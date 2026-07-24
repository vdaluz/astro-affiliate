import type { AffiliateConfig } from './types.ts';
import { resolveLocalized } from './i18n.ts';

/**
 * Resolves a post's `affiliates:` frontmatter names to their disclosure text.
 * Throws on an unknown program name instead of silently omitting its
 * disclosure - a typo'd/renamed program must fail the build, not ship a
 * page that uses the program without disclosing it.
 */
export function resolveDisclosures(config: AffiliateConfig, affiliates: string[], locale?: string): string[] {
  return affiliates.map((name) => {
    const program = config.programs[name];
    if (!program) {
      throw new Error(
        `Unknown affiliate program "${name}" in "affiliates:" frontmatter. Known programs: ${Object.keys(config.programs).join(', ') || '(none configured)'}.`
      );
    }
    return resolveLocalized(program.disclosure, locale);
  });
}
