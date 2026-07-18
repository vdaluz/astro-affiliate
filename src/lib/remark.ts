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

    for (const node of linkNodes) {
      const key = node.url!.slice(AFFILIATE_PREFIX.length);
      const { url, program } = resolveAffiliate(config, key);
      node.url = url;
      usedPrograms.add(program);
    }

    for (const program of usedPrograms) {
      if (!declaredAffiliates.includes(program)) {
        throw new Error(
          `Post uses an "${program}" affiliate link but doesn't declare "affiliates: [${program}, ...]" in its frontmatter. Add it so the disclosure renders.`
        );
      }
    }
  };
}
