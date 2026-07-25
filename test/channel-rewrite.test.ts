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
  },
  catalog: {
    atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
    deepWork: { program: 'amazon', asin: 'B01N9SPZLB' },
    protonPass: { program: 'proton', link: 'pass' },
    multiParamDeal: { program: 'multiParam', link: 'deal' },
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
