import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remarkAffiliate } from '../src/lib/remark.ts';
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
      disclosure: 'proton disclosure',
      links: { pass: 'https://go.getproton.me/SH2FI' },
    },
  },
  catalog: {
    atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
    protonPass: { program: 'proton', link: 'pass' },
  },
};

function fileWithAffiliates(affiliates: string[]): {
  data: { astro: { frontmatter: { affiliates: string[]; affiliateKeys?: string[] } } };
} {
  return { data: { astro: { frontmatter: { affiliates } } } };
}

test('rewrites an affiliate link nested inside a paragraph to its resolved URL', () => {
  const link = { type: 'link', url: 'affiliate:atomicHabits', children: [] };
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [link] }],
  };

  remarkAffiliate(config)(tree, fileWithAffiliates(['amazon']));

  assert.equal(link.url, 'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20');
});

test('throws on an unknown affiliate catalog key', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'link', url: 'affiliate:nope', children: [] }],
  };

  assert.throws(
    () => remarkAffiliate(config)(tree, fileWithAffiliates(['amazon'])),
    /Unknown affiliate catalog key/
  );
});

test('throws when a used program is not declared in frontmatter', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'link', url: 'affiliate:atomicHabits', children: [] }],
  };

  assert.throws(() => remarkAffiliate(config)(tree, fileWithAffiliates([])), /doesn't declare/);
});

test('does nothing when the tree has no affiliate links, even with no frontmatter', () => {
  const paragraph = { type: 'paragraph', children: [{ type: 'text' }] };
  const tree = { type: 'root', children: [paragraph] };
  const file: { data?: { astro?: { frontmatter?: { affiliateKeys?: string[] } } } } = {};

  assert.doesNotThrow(() => remarkAffiliate(config)({ ...tree }, file));
  assert.equal(file.data, undefined);
});

test('rewrites a reference-style link, whose URL lives on a sibling definition node', () => {
  const definition = { type: 'definition', identifier: 'ah', url: 'affiliate:atomicHabits' };
  const linkReference = { type: 'linkReference', identifier: 'ah', children: [] };
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [linkReference] }, definition],
  };
  const file = fileWithAffiliates(['amazon']);

  remarkAffiliate(config)(tree, file);

  assert.equal(definition.url, 'https://www.amazon.com/dp/B07RFSSYBH/ref=nosim?tag=vdaluz-20');
  assert.deepEqual(file.data.astro.frontmatter.affiliateKeys, ['atomicHabits']);
});

test('throws when an affiliate URL sits on a node type the collector does not handle', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'image', url: 'affiliate:atomicHabits', alt: 'cover' }],
  };

  assert.throws(
    () => remarkAffiliate(config)(tree, fileWithAffiliates(['amazon'])),
    /Unrewritten affiliate link .* on a "image" node/
  );
});

test('writes affiliateKeys in document order with duplicates removed', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'link', url: 'affiliate:atomicHabits', children: [] },
      { type: 'link', url: 'affiliate:protonPass', children: [] },
      { type: 'link', url: 'affiliate:atomicHabits', children: [] },
    ],
  };
  const file = fileWithAffiliates(['amazon', 'proton']);

  remarkAffiliate(config)(tree, file);

  assert.deepEqual(file.data.astro.frontmatter.affiliateKeys, ['atomicHabits', 'protonPass']);
});
