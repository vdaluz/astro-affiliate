import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAffiliate } from '../src/lib/resolve.ts';
import type { AffiliateConfig } from '../src/lib/types.ts';

const config: AffiliateConfig = {
  programs: {
    amazon: {
      kind: 'amazon',
      tag: 'vdaluz-20',
      channelTags: { medium: 'vdaluz-medium-20' },
      disclosure: 'default disclosure',
    },
    proton: {
      kind: 'links',
      disclosure: 'proton disclosure',
      links: { pass: 'https://go.getproton.me/SH2FI' },
      channelLinks: { medium: { pass: 'https://go.getproton.me/MEDIUM' } },
    },
  },
  catalog: {
    atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
    protonPass: { program: 'proton', link: 'pass' },
  },
};

test('resolves an amazon catalog key to the default tag with no channel', () => {
  const { url } = resolveAffiliate(config, 'atomicHabits');
  assert.equal(url, 'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20');
});

test('resolves an amazon catalog key to the channel tag when configured', () => {
  const { url } = resolveAffiliate(config, 'atomicHabits', 'medium');
  assert.equal(url, 'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-medium-20');
});

test('falls back to the default amazon tag for an unconfigured channel', () => {
  const { url } = resolveAffiliate(config, 'atomicHabits', 'linkedin');
  assert.equal(url, 'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20');
});

test('resolves a links catalog key to the default link with no channel', () => {
  const { url } = resolveAffiliate(config, 'protonPass');
  assert.equal(url, 'https://go.getproton.me/SH2FI');
});

test('resolves a links catalog key to the channel link when configured', () => {
  const { url } = resolveAffiliate(config, 'protonPass', 'medium');
  assert.equal(url, 'https://go.getproton.me/MEDIUM');
});

test('falls back to the default link for an unconfigured channel', () => {
  const { url } = resolveAffiliate(config, 'protonPass', 'linkedin');
  assert.equal(url, 'https://go.getproton.me/SH2FI');
});

test('throws on an unknown catalog key', () => {
  assert.throws(() => resolveAffiliate(config, 'nope'), /Unknown affiliate catalog key/);
});

test('resolves an amazon catalog key against www.amazon.com when domain is unset', () => {
  const { url } = resolveAffiliate(config, 'atomicHabits');
  assert.match(url, /^https:\/\/www\.amazon\.com\//);
});

test('resolves an amazon catalog key against a configured marketplace domain', () => {
  const brConfig: AffiliateConfig = {
    programs: {
      amazonBr: { kind: 'amazon', domain: 'www.amazon.com.br', tag: 'vdaluz-br-20', disclosure: 'br disclosure' },
    },
    catalog: {
      atomicHabitsBr: { program: 'amazonBr', asin: 'B07RFSSYBH' },
    },
  };
  const { url } = resolveAffiliate(brConfig, 'atomicHabitsBr');
  assert.equal(url, 'https://www.amazon.com.br/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-br-20');
});

test('throws when a catalog entry references an unknown program', () => {
  const broken: AffiliateConfig = {
    programs: config.programs,
    catalog: { orphan: { program: 'missing', asin: 'B07RFSSYBH' } },
  };
  assert.throws(() => resolveAffiliate(broken, 'orphan'), /references unknown program "missing"/);
});

test('throws when an asin entry points at a links program', () => {
  const broken: AffiliateConfig = {
    programs: config.programs,
    catalog: { mismatched: { program: 'proton', asin: 'B07RFSSYBH' } },
  };
  assert.throws(() => resolveAffiliate(broken, 'mismatched'), /is kind "links", not "amazon"/);
});

test('throws when a link entry points at an amazon program', () => {
  const broken: AffiliateConfig = {
    programs: config.programs,
    catalog: { mismatched: { program: 'amazon', link: 'pass' } },
  };
  assert.throws(() => resolveAffiliate(broken, 'mismatched'), /is kind "amazon", not "links"/);
});

test('throws when a link entry names a key missing from the program links', () => {
  const broken: AffiliateConfig = {
    programs: config.programs,
    catalog: { missingLink: { program: 'proton', link: 'vpn' } },
  };
  assert.throws(() => resolveAffiliate(broken, 'missingLink'), /references unknown link "vpn"/);
});

test('throws when a catalog entry has neither asin nor link', () => {
  const broken: AffiliateConfig = {
    programs: config.programs,
    catalog: { empty: { program: 'amazon' } as unknown as AffiliateConfig['catalog'][string] },
  };
  assert.throws(() => resolveAffiliate(broken, 'empty'), /has neither "asin" nor "link"/);
});

test('falls back to the default link when the channel map exists but lacks this link key', () => {
  const partial: AffiliateConfig = {
    programs: {
      proton: {
        kind: 'links',
        disclosure: 'proton disclosure',
        links: { pass: 'https://go.getproton.me/SH2FI' },
        channelLinks: { medium: { other: 'https://go.getproton.me/OTHER' } },
      },
    },
    catalog: { protonPass: { program: 'proton', link: 'pass' } },
  };
  const { url } = resolveAffiliate(partial, 'protonPass', 'medium');
  assert.equal(url, 'https://go.getproton.me/SH2FI');
});
