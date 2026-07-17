# @vdaluz/astro-affiliate

Shared affiliate-link catalog resolver and disclosure components for vdaluz.com-family sites. Ships raw `.astro` and `.ts` - the consuming app's Astro/Vite compiles them (no prebuild step). Machinery only: the package carries no affiliate data itself, each site supplies its own catalog, tracking tags, and disclosure text via config.

## Install

Pinned https tarball from a tag (no registry needed):

```jsonc
// package.json
"dependencies": {
  "@vdaluz/astro-affiliate": "https://github.com/vdaluz/astro-affiliate/archive/refs/tags/v0.2.0.tar.gz"
}
```

> **Why a tarball, not `github:vdaluz/astro-affiliate#v0.2.0`?** npm canonicalizes GitHub
> shorthand (and even an explicit `git+https://` URL) to `git+ssh://` in the lockfile.
> CI runners (e.g. Cloudflare Pages/Workers) have no SSH key, so `npm ci` would fail to
> clone it. The `/archive/refs/tags/<tag>.tar.gz` URL is anonymous https with an integrity
> hash in the lockfile, it just works in CI. Bump the tag in the URL to upgrade.

Peer dependency: `astro` >= 6.

## Define your config

Two top-level pieces: `programs` (disclosure text + how to resolve a program's links) and
`catalog` (a single flat list of every item, each pointing at the program that resolves it).

```ts
// src/config/affiliate.ts
import { defineAffiliateConfig } from '@vdaluz/astro-affiliate';

export const affiliate = defineAffiliateConfig({
  programs: {
    amazon: {
      kind: 'amazon',
      tag: 'vdaluz-20',
      disclosure: 'As an Amazon Associate, I earn from qualifying purchases.',
    },
    proton: {
      kind: 'links',
      disclosure: 'As a Proton Partner, I earn from qualifying purchases.',
      links: { pass: 'https://go.getproton.me/SH2FI' },
    },
  },
  catalog: {
    atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
    protonPass: { program: 'proton', link: 'pass' },
  },
});
```

Two program kinds:

- **`amazon`** - supply a site tag once; catalog entries reference it with just an ASIN. The URL
  is constructed as `https://www.amazon.com/dp/<ASIN>/ref=nosim?tag=<tag>`.
- **`links`** - a flat link-key-to-URL map on the program; catalog entries reference one of those
  keys.

Catalog keys are flat and unprefixed (`atomicHabits`, not `amazon.atomicHabits`) - that's what
markdown links and `<AffiliateLink>` use directly. Each entry accepts an optional `category`
string, ignored by resolution, for a consuming app's own filtering (e.g. a gear page listing only
`category: 'gear'` entries).

## Markdown links (`remarkAffiliate`)

Wire the plugin into `astro.config.mjs`:

```js
import { remarkAffiliate } from '@vdaluz/astro-affiliate/remark';
import { affiliate } from './src/config/affiliate';

export default defineConfig({
  markdown: {
    remarkPlugins: [[remarkAffiliate, affiliate]],
  },
});
```

> **Use the `[plugin, options]` tuple, not `remarkAffiliate(affiliate)` pre-invoked.** Astro/unified
> calls the plugin function itself with the options; passing an already-invoked transformer means
> unified calls *that* with no arguments as if it were the attacher, which silently no-ops instead
> of rewriting anything - the build stays green with `affiliate:key` links left untouched in the
> output. Always verify by checking rendered HTML for the real resolved URL, not just a passing
> build.

Then in a post's markdown body:

```md
---
title: My post
affiliates: [amazon]
---

I use [Atomic Habits](affiliate:atomicHabits) to stay on track.
```

`affiliate:atomicHabits` is rewritten to the real resolved URL at build time. An unknown key
fails the build. **Compliance by construction:** every program actually used by `affiliate:`
links in a post must be declared in that post's `affiliates:` frontmatter array, or the build
fails with a clear error - there's no way to ship an affiliate link without its disclosure.

## `.astro` pages (`<AffiliateLink>`)

For gear pages or other non-markdown content:

```astro
---
import AffiliateLink from '@vdaluz/astro-affiliate/AffiliateLink.astro';
import { affiliate } from '../config/affiliate';
---

<AffiliateLink config={affiliate} affiliateKey="atomicHabits">
  Atomic Habits
</AffiliateLink>
```

Renders `target="_blank" rel="noopener noreferrer sponsored"` by default. Pass `class` to style it.

## Disclosure (`<AffiliateDisclosure>`)

Render at the **top** of the post body, above any affiliate links (FTC: disclosure before links,
above the fold):

```astro
---
import AffiliateDisclosure from '@vdaluz/astro-affiliate/AffiliateDisclosure.astro';
import { affiliate } from '../config/affiliate';

const { affiliates = [] } = entry.data;
---

<AffiliateDisclosure config={affiliate} affiliates={affiliates} />
```

Renders one paragraph joining the disclosure text for every program in `affiliates`, or nothing
if the array is empty. Default styling is `text-sm text-muted italic`; pass `class` to override,
see [Per-app glue](#per-app-glue) for the token variables this assumes.

## Per-app glue

This is a component library, not a drop-in catalog. Each consuming app owns:

- Its own `affiliate` config (programs, catalog, tags, disclosure text). Nothing is shared across
  sites.
- The `affiliates:` field in its content collection schema (add `affiliates: z.array(z.string()).optional()`).
- Token CSS variables referenced by the default disclosure styling: `muted`. See
  [`@vdaluz/astro-blog`'s `tokens.example.css`](https://github.com/vdaluz/astro-blog) for the
  full token set these sites already share.

## Release process

Tag-pinned tarballs, no registry:

1. Test before tagging: `npm pack`, install the tarball into a scratch Astro app (or one of the
   consumers locally), `astro check && astro build`.
2. Bump `version` in `package.json`, commit.
3. Tag `vX.Y.Z` and push the tag. **The tag must be public before any consumer CI references
   it**, the tarball URL 404s otherwise.
4. Bump the tag in each consumer's `package.json` dependency URL.

## Consumers

- [vdaluz.com](https://vdaluz.com)
- [imperfectsystems.com](https://imperfectsystems.com)
