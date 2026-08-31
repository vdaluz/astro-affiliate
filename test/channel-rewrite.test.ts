import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChannelRewriteMap, rewriteAffiliateLinksForChannel } from '../src/lib/channel-rewrite.ts';
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
    },
    multiParam: {
      kind: 'links',
      disclosure: 'multi-param disclosure',
      links: { deal: 'https://example.com/deal?ref=vdaluz&utm_source=site' },
      channelLinks: { medium: { deal: 'https://example.com/deal?ref=vdaluz-medium&utm_source=site' } },
    },
    prefixed: {
      kind: 'links',
      disclosure: 'prefix-collision disclosure',
      links: { a: 'https://ex1.com/go', b: 'https://ex1.com/go?x=1' },
      channelLinks: { medium: { a: 'https://ex1.com/go-m', b: 'https://ex1.com/other' } },
    },
    channelUrlPrefix: {
      kind: 'links',
      disclosure: 'channel-URL prefix-collision disclosure',
      links: { short: 'https://ex2.com/go', long: 'https://ex2.com/go?x=1' },
      channelLinks: { medium: { short: 'https://ex2.com/go-m', long: 'https://ex2.com/go?x=2' } },
    },
  },
  catalog: {
    atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
    deepWork: { program: 'amazon', asin: 'B01N9SPZLB' },
    protonPass: { program: 'proton', link: 'pass' },
    multiParamDeal: { program: 'multiParam', link: 'deal' },
    prefixedShort: { program: 'prefixed', link: 'a' },
    prefixedLong: { program: 'prefixed', link: 'b' },
    channelUrlPrefixShort: { program: 'channelUrlPrefix', link: 'short' },
    channelUrlPrefixLong: { program: 'channelUrlPrefix', link: 'long' },
  },
};

test('buildChannelRewriteMap only includes entries where the channel actually differs', () => {
  const map = buildChannelRewriteMap(config, 'medium');
  assert.deepEqual(map, {
    'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20':
      'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-medium-20',
    'https://www.amazon.com/dp/B01N9SPZLB/ref=nosim?tag=vdaluz-20':
      'https://www.amazon.com/dp/B01N9SPZLB/ref=nosim?tag=vdaluz-medium-20',
    'https://example.com/deal?ref=vdaluz&utm_source=site':
      'https://example.com/deal?ref=vdaluz-medium&utm_source=site',
    'https://example.com/deal?ref=vdaluz&amp;utm_source=site':
      'https://example.com/deal?ref=vdaluz-medium&amp;utm_source=site',
    'https://ex1.com/go': 'https://ex1.com/go-m',
    'https://ex1.com/go?x=1': 'https://ex1.com/other',
    'https://ex2.com/go': 'https://ex2.com/go-m',
    'https://ex2.com/go?x=1': 'https://ex2.com/go?x=2',
  });
});

test('buildChannelRewriteMap adds the HTML-escaped variant only for a default URL containing an ampersand', () => {
  const map = buildChannelRewriteMap(config, 'medium');
  // Amazon URLs here have a single query param, no ampersand, so no escaped variant is added.
  assert.equal('https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20&amp;' in map, false);
});

test('rewriteAffiliateLinksForChannel rewrites a multi-param URL as it actually appears in rendered HTML (escaped)', () => {
  const html = '<a href="https://example.com/deal?ref=vdaluz&amp;utm_source=site">Deal</a>';
  const rewritten = rewriteAffiliateLinksForChannel(html, config, 'medium');
  assert.equal(rewritten, '<a href="https://example.com/deal?ref=vdaluz-medium&amp;utm_source=site">Deal</a>');
});

test('buildChannelRewriteMap is empty for a channel with no overrides configured', () => {
  const map = buildChannelRewriteMap(config, 'linkedin');
  assert.deepEqual(map, {});
});

test('rewriteAffiliateLinksForChannel swaps every occurrence of a default URL', () => {
  const html =
    '<a href="https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20">Atomic Habits</a>' +
    '<p>mentioned twice: <a href="https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20">again</a></p>' +
    '<a href="https://go.getproton.me/SH2FI">Proton Pass</a>';

  const rewritten = rewriteAffiliateLinksForChannel(html, config, 'medium');

  assert.equal((rewritten.match(/vdaluz-medium-20/g) || []).length, 2);
  assert.ok(!rewritten.includes('tag=vdaluz-20"'));
  assert.ok(rewritten.includes('https://go.getproton.me/SH2FI'), 'proton link has no channel override, must be untouched');
});

test('rewriteAffiliateLinksForChannel leaves content unchanged for a channel with no overrides', () => {
  const html = '<a href="https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20">Atomic Habits</a>';
  assert.equal(rewriteAffiliateLinksForChannel(html, config, 'linkedin'), html);
});

test('rewriteAffiliateLinksForChannel handles a default URL that is a prefix of another entry\'s default URL', () => {
  const html =
    '<a href="https://ex1.com/go">Short</a><a href="https://ex1.com/go?x=1">Long</a>';
  const rewritten = rewriteAffiliateLinksForChannel(html, config, 'medium');
  assert.ok(rewritten.includes('href="https://ex1.com/go-m"'));
  assert.ok(rewritten.includes('href="https://ex1.com/other"'));
});

test('rewriteAffiliateLinksForChannel handles a default URL that is a prefix of another entry\'s already-rewritten channel URL', () => {
  // channelUrlPrefix: short's default 'https://ex2.com/go' is a prefix of
  // long's *channel* URL 'https://ex2.com/go?x=2', not of long's default -
  // a sequential split/join pass (even sorted longest-default-first) would
  // rewrite long correctly, then have short's later pass corrupt that output.
  const html =
    '<a href="https://ex2.com/go">Short</a><a href="https://ex2.com/go?x=1">Long</a>';
  const rewritten = rewriteAffiliateLinksForChannel(html, config, 'medium');
  assert.ok(rewritten.includes('href="https://ex2.com/go-m"'));
  assert.ok(rewritten.includes('href="https://ex2.com/go?x=2"'));
});
