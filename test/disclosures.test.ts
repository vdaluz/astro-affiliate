import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDisclosures } from '../src/lib/disclosures.ts';
import type { AffiliateConfig } from '../src/lib/types.ts';

const config: AffiliateConfig = {
  programs: {
    amazon: {
      kind: 'amazon',
      tag: 'vdaluz-20',
      disclosure: 'default disclosure',
    },
    proton: {
      kind: 'links',
      disclosure: { default: 'default proton disclosure', es: 'divulgacion de proton' },
      links: { pass: 'https://go.getproton.me/SH2FI' },
    },
  },
  catalog: {},
};

test('resolves known program names to their disclosure text, in order', () => {
  const disclosures = resolveDisclosures(config, ['amazon', 'proton']);
  assert.deepEqual(disclosures, ['default disclosure', 'default proton disclosure']);
});

test('collapses repeated program names to one entry, keeping first-seen order', () => {
  const disclosures = resolveDisclosures(config, ['amazon', 'proton', 'amazon', 'amazon']);
  assert.deepEqual(disclosures, ['default disclosure', 'default proton disclosure']);
});

test('still throws on a repeated unknown program name', () => {
  assert.throws(
    () => resolveDisclosures(config, ['typo-program', 'typo-program']),
    /Unknown affiliate program "typo-program"/
  );
});

test('resolves localized disclosure text when a locale is given', () => {
  const disclosures = resolveDisclosures(config, ['proton'], 'es');
  assert.deepEqual(disclosures, ['divulgacion de proton']);
});

test('throws on an unknown program name instead of silently omitting it', () => {
  assert.throws(
    () => resolveDisclosures(config, ['amazon', 'typo-program']),
    /Unknown affiliate program "typo-program".*Known programs: amazon, proton/
  );
});
