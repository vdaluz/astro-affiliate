import type { AffiliateConfig, ResolvedAffiliate } from './types';

/**
 * Resolves a flat catalog key (e.g. 'atomicHabits', 'protonPass') against a
 * site's affiliate config into a real URL. Throws on an unknown key, an
 * unknown program, or a catalog entry/program kind mismatch - an unresolvable
 * affiliate link is a build failure, not a silently broken link.
 */
export function resolveAffiliate(config: AffiliateConfig, key: string): ResolvedAffiliate {
  const entry = config.catalog[key];
  if (!entry) {
    throw new Error(
      `Unknown affiliate catalog key "${key}". Known keys: ${Object.keys(config.catalog).join(', ') || '(none configured)'}.`
    );
  }

  const program = config.programs[entry.program];
  if (!program) {
    throw new Error(`Catalog key "${key}" references unknown program "${entry.program}".`);
  }

  if ('asin' in entry) {
    if (program.kind !== 'amazon') {
      throw new Error(
        `Catalog key "${key}" has an "asin" field, but program "${entry.program}" is kind "${program.kind}", not "amazon".`
      );
    }
    return {
      url: `https://www.amazon.com/dp/${entry.asin}/ref=nosim?tag=${program.tag}`,
      program: entry.program,
    };
  }

  if ('link' in entry) {
    if (program.kind !== 'links') {
      throw new Error(
        `Catalog key "${key}" has a "link" field, but program "${entry.program}" is kind "${program.kind}", not "links".`
      );
    }
    const url = program.links[entry.link];
    if (!url) {
      throw new Error(
        `Catalog key "${key}" references unknown link "${entry.link}" in program "${entry.program}".`
      );
    }
    return { url, program: entry.program };
  }

  throw new Error(`Catalog key "${key}" has neither "asin" nor "link".`);
}
