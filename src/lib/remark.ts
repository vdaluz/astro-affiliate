import type { AffiliateConfig } from './types.ts';
import { resolveAffiliate } from './resolve.ts';

const AFFILIATE_PREFIX = 'affiliate:';

/** Minimal shape this plugin cares about - avoids a mdast-util-* type dependency. */
interface MdastNode {
  type: string;
  url?: string;
  children?: MdastNode[];
}

interface VFileWithAstroFrontmatter {
  data?: {
    astro?: {
      frontmatter?: {
        affiliates?: string[];
        affiliateKeys?: string[];
      };
    };
  };
}

function collectAffiliateLinkNodes(node: MdastNode, out: MdastNode[]) {
  if (node.type === 'link' && typeof node.url === 'string' && node.url.startsWith(AFFILIATE_PREFIX)) {
    out.push(node);
  }
  if (node.children) {
    for (const child of node.children) collectAffiliateLinkNodes(child, out);
  }
}

/**
 * Remark plugin: rewrites `[text](affiliate:catalogKey)` links to their real
 * resolved URL at build time, and enforces FTC compliance by construction -
 * every program actually used by a post must be declared in that post's
 * `affiliates:` frontmatter (so `<AffiliateDisclosure>` knows to render it).
 * An unknown key, or a used program missing from frontmatter, fails the build.
 *
 * Also writes the post's own affiliate catalog keys, in document order with
 * duplicates removed, to `affiliateKeys` in the page's frontmatter (via
 * `remarkPluginFrontmatter`) - undefined, not an empty array, on a post with
 * no affiliate links, so a consumer should read it as `affiliateKeys ?? []`.
 *
 *   import { remarkAffiliate } from '@vdaluz/astro-affiliate/remark';
 *
 *   export default defineConfig({
 *     markdown: { remarkPlugins: [[remarkAffiliate, affiliate]] },
 *   });
 */
export function remarkAffiliate(config: AffiliateConfig) {
  return (tree: MdastNode, file: VFileWithAstroFrontmatter) => {
    const linkNodes: MdastNode[] = [];
    collectAffiliateLinkNodes(tree, linkNodes);
    if (linkNodes.length === 0) return;

    const declaredAffiliates = file.data?.astro?.frontmatter?.affiliates ?? [];
    const usedPrograms = new Set<string>();
    const usedKeys: string[] = [];

    for (const node of linkNodes) {
      const key = node.url!.slice(AFFILIATE_PREFIX.length);
      const { url, program } = resolveAffiliate(config, key);
      node.url = url;
      usedPrograms.add(program);
      if (!usedKeys.includes(key)) usedKeys.push(key);
    }

    for (const program of usedPrograms) {
      if (!declaredAffiliates.includes(program)) {
        throw new Error(
          `Post uses an "${program}" affiliate link but doesn't declare "affiliates: [${program}, ...]" in its frontmatter. Add it so the disclosure renders.`
        );
      }
    }

    file.data ??= {};
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.affiliateKeys = usedKeys;
  };
}
