import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as pkg from '../src/index.ts';

test('package entry exports the expected public API', () => {
  assert.equal(typeof pkg.defineAffiliateConfig, 'function');
  assert.equal(typeof pkg.resolveAffiliate, 'function');
  assert.equal(typeof pkg.buildChannelRewriteMap, 'function');
  assert.equal(typeof pkg.rewriteAffiliateLinksForChannel, 'function');
  assert.equal(typeof pkg.resolveAffiliateCards, 'function');
  assert.equal(typeof pkg.resolveDisclosures, 'function');
});
