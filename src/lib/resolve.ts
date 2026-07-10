import type { AffiliateConfig, ResolvedAffiliate } from './types';

/**
 * Resolves a `program.itemKey` key (e.g. 'amazon.atomicHabits', 'proton.pass')
 * against a site's affiliate config into a real URL. Throws on an unknown
 * program or item - an unresolvable affiliate link is a build failure, not a
 * silently broken link.
 */
export function resolveAffiliate(config: AffiliateConfig, key: string): ResolvedAffiliate {
  const dotIndex = key.indexOf('.');
  if (dotIndex === -1) {
    throw new Error(
      `Invalid affiliate key "${key}": expected "program.itemKey" (e.g. "amazon.atomicHabits").`
    );
  }

  const programName = key.slice(0, dotIndex);
  const itemKey = key.slice(dotIndex + 1);
  const program = config.programs[programName];
  if (!program) {
    throw new Error(
      `Unknown affiliate program "${programName}" in key "${key}". Known programs: ${Object.keys(config.programs).join(', ') || '(none configured)'}.`
    );
  }

  const item = program.items[itemKey];
  if (!item) {
    throw new Error(
      `Unknown affiliate item "${itemKey}" for program "${programName}" in key "${key}".`
    );
  }

  const url =
    program.kind === 'amazon' ? `https://www.amazon.com/dp/${item}/ref=nosim?tag=${program.tag}` : item;

  return { url, program: programName };
}
