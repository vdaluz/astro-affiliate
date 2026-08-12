import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAffiliateCards } from '../src/lib/affiliate-cards.ts';

const display = {
  a: { name: 'A', blurb: 'blurb a', postCategories: ['Networking'] },
  b: { name: 'B', blurb: 'blurb b', postCategories: ['Networking'] },
  c: { name: 'C', blurb: 'blurb c', postCategories: ['Infrastructure'] },
  d: { name: 'D', blurb: 'blurb d' },
  e: { name: 'E', blurb: 'blurb e' },
};
const generic = ['d', 'e'];

test("fills all 3 slots from the post's own inline links, in document order", () => {
  const result = resolveAffiliateCards({
    postKeys: ['c', 'a', 'b'],
    postCategory: 'Networking',
    postSlug: 'test-post',
    display,
    generic,
  });
  assert.deepEqual(
    result.map((r) => r.key),
    ['c', 'a', 'b']
  );
});

test('truncates to the first 3 inline links when a post has more than 3', () => {
  const result = resolveAffiliateCards({
    postKeys: ['a', 'b', 'c', 'd'],
    postCategory: 'Networking',
    postSlug: 'test-post',
    display,
    generic,
  });
  assert.deepEqual(
    result.map((r) => r.key),
    ['a', 'b', 'c']
  );
});

test('falls through to category-matched entries when inline links are short of 3', () => {
  const result = resolveAffiliateCards({
    postKeys: ['a'],
    postCategory: 'Networking',
    postSlug: 'test-post',
    display,
    generic,
  });
  assert.equal(result.length, 3);
  assert.equal(result[0].key, 'a'); // inline link always leads
  assert.equal(result[1].key, 'b'); // only other Networking-tagged entry
  assert.ok(['d', 'e'].includes(result[2].key)); // final slot pools category leftovers + generics
});

test('falls through to generic defaults when inline + category-matched are short of 3', () => {
  const result = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Wellness', // no entries tagged Wellness in this fixture
    postSlug: 'test-post',
    display,
    generic,
  });
  assert.deepEqual(new Set(result.map((r) => r.key)), new Set(['d', 'e']));
});

test('dedupes across tiers - an inline key that is also a generic default only appears once', () => {
  const result = resolveAffiliateCards({
    postKeys: ['d'],
    postCategory: 'Wellness',
    postSlug: 'test-post',
    display,
    generic,
  });
  assert.deepEqual(
    result.map((r) => r.key),
    ['d', 'e']
  );
});

test('skips an inline key with no display entry rather than throwing, and keeps filling from later tiers', () => {
  const result = resolveAffiliateCards({
    postKeys: ['unknownKey', 'a'],
    postCategory: 'Networking',
    postSlug: 'test-post',
    display,
    generic,
  });
  // 'unknownKey' is skipped, 'a' fills slot 1, tier 2 (category match) fills
  // slot 2 with 'b', the final slot pools category leftovers + generics.
  assert.equal(result.length, 3);
  assert.deepEqual(result.map((r) => r.key).slice(0, 2), ['a', 'b']);
  assert.ok(['d', 'e'].includes(result[2].key));
});

test('returns fewer than 3 when the pool genuinely runs out', () => {
  const result = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Leadership',
    postSlug: 'test-post',
    display: { only: { name: 'Only', blurb: 'blurb' } },
    generic: [],
  });
  assert.deepEqual(
    result.map((r) => r.key),
    []
  );
});

test('never returns more than 3 entries or a duplicate key, across many category/generic combinations', () => {
  for (const category of ['Networking', 'Infrastructure', 'Wellness', 'Leadership']) {
    for (const slug of ['alpha', 'bravo', 'charlie', 'delta', 'echo']) {
      const result = resolveAffiliateCards({
        postKeys: [],
        postCategory: category,
        postSlug: slug,
        display,
        generic,
      });
      assert.ok(result.length <= 3);
      assert.equal(result.length, new Set(result.map((r) => r.key)).size);
    }
  }
});

test('the same postSlug always resolves to the same card set (deterministic across rebuilds/locales)', () => {
  const first = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Wellness',
    postSlug: 'homelab-post-one',
    display,
    generic,
  });
  const second = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Wellness',
    postSlug: 'homelab-post-one',
    display,
    generic,
  });
  assert.deepEqual(
    first.map((r) => r.key),
    second.map((r) => r.key)
  );
});

test('different postSlugs can resolve to different orderings for the same category', () => {
  // Verified against the real hash+PRNG: 'post-one' -> ['e', 'd'], 'post-two' -> ['d', 'e'].
  const resultOne = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Wellness',
    postSlug: 'post-one',
    display,
    generic,
  });
  const resultTwo = resolveAffiliateCards({
    postKeys: [],
    postCategory: 'Wellness',
    postSlug: 'post-two',
    display,
    generic,
  });
  assert.notDeepEqual(
    resultOne.map((r) => r.key),
    resultTwo.map((r) => r.key)
  );
});
