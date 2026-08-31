# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this repo is

`@vdaluz/astro-affiliate`: shared affiliate-link catalog resolver and disclosure components for vdaluz.com-family sites. Machinery only - the package carries no affiliate data itself; each site supplies its own catalog, tracking tags, and disclosure text via config. Consumed by vdaluz.com, imperfectsystems.com, freetoolbox.net, and vicstradamus.com (`src/pages/releases/[slug].astro`) as an npm-registry semver pin.

## Workflow

Shared preamble: `.claude/rules/git-workflow-direct-to-main.md`.

## Conventions

Shared `@vdaluz/astro-*` conventions (raw source/no build step, per-path exports):
`.claude/rules/astro-package-conventions.md`.

- **Explicit `.ts` extensions on relative imports** (matches astro-og-cards) - required for `node --test` to resolve them directly without a bundler.
- **Dependency-free.** No runtime dependencies. Keep it that way unless the maintainer explicitly decides otherwise.
- **Compliance by construction, not convenience.** `remarkAffiliate` enforces used ⊆ declared (an affiliate link used without its program in frontmatter fails the build) and `resolveAffiliate` throws on any unresolvable key/program/kind mismatch rather than silently producing a broken or undisclosed link. Preserve this "unresolvable is a build failure" property in any change to the resolution path.
- **Token-driven default styling.** `<AffiliateDisclosure>`'s default class references the `muted` token custom property (see [`@vdaluz/astro-blog`'s `tokens.example.css`](https://github.com/vdaluz/astro-blog) for the full token set the family sites share). Never hardcode a site's palette; consumers can always override via the `class` prop.

## Release process

Same tag-then-npm-publish process shared by all `@vdaluz/*` component libraries, consumed via
npm-registry semver pins (not tarball URLs). See the README's "Releasing" section for the
concrete steps.

## Consumers

- [vdaluz.com](https://vdaluz.com)
- [imperfectsystems.com](https://imperfectsystems.com)
- [freetoolbox.net](https://freetoolbox.net)
- [vicstradamus.com](https://vicstradamus.com)
