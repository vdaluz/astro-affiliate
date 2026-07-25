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

function fileWithAffiliates(affiliates: string[]) {
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

  assert.doesNotThrow(() => remarkAffiliate(config)({ ...tree }, {}));
});
