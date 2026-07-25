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
