# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.1.0] - 2026-09-04

### Added

- Export `resolveDisclosures` and the `Localized` type from the package entry, so consumers that need disclosure text outside an `.astro` page (RSS items, channel-export pipelines, plain-text newsletters) can call it directly instead of reimplementing the lookup.

### Documentation

- Documented `resolveAffiliateCards` in the README (three-tier fill algorithm, the 3-card cap, deterministic `postSlug` seeding, the `affiliateKeys` handoff from `remarkAffiliate`) - exported and tested since 0.8.0, but never mentioned in the README.

### Fixed

- `remarkAffiliate` ignored reference-style links (`[text][ref]` + a `[ref]: affiliate:key` definition) - the plugin found no `link` nodes to rewrite, so the raw `affiliate:key` URL shipped to the page and the used-⊆-declared compliance check never saw it, with no build error. Reference-style `affiliate:` links now resolve correctly, and any node type the plugin still can't handle (e.g. an image) now fails the build instead of shipping a broken href.
- `rewriteAffiliateLinksForChannel` corrupted its own output whenever one catalog entry's default URL was a prefix of another entry's default or channel URL - each entry ran as a separate `split/join` pass, so a shorter entry's later pass could rewrite the inside of an already-rewritten (or not-yet-processed) longer URL, leaving neither the default nor the intended channel URL. Now a single regex pass (longest URL first, so alternation can't award the match to a shorter prefix) replaces every entry at once, so no pass can re-scan or corrupt another pass's output.

## [1.0.0] - 2026-08-22

### Changed

- **Stability declaration only, no breaking changes.** 14 releases in with no breaking changes recorded and stable in production across multiple sites - this bump declares the public API stable, not a rewrite. Future breaking changes will bump the major version as semver expects from here on.

## [0.8.1] - 2026-08-22

### Fixed

- README Consumers list was missing freetoolbox.net and vicstradamus.com, both of which already depend on and use the package.

### Removed

- Dropped the tarball-install alternative from the README - every consumer moved to npm-registry semver pins, and the tarball block's hardcoded version tag had drifted from the published version.

### Documentation

- Added npm version and license badges. Standardized the README's tail-section order and added a License section.

## [0.8.0] - 2026-08-12

### Added

- `resolveAffiliateCards`, a deterministic card-fill resolver for related-affiliate widgets: fills up to 3 slots per post from the post's own inline links, then category-matched catalog entries, then generic defaults, seeded per `postSlug` so the same post shows the same cards on every rebuild and across locales. Exports `AffiliateCardDisplay`, `AffiliateCardEntry`, and `ResolveAffiliateCardsInput`.

## [0.7.0] - 2026-08-09

### Added

- `remarkAffiliate` now writes the post's own catalog keys (document order, duplicates removed) to `affiliateKeys` in the page's frontmatter, via `remarkPluginFrontmatter` - so a consumer can read which catalog items a post actually linked to without re-parsing markdown. Undefined, not an empty array, when a post has no affiliate links.

## [0.6.0] - 2026-08-08

### Added

- `AffiliateLink.astro` renders `data-affiliate-key`, `data-affiliate-channel`, and `data-affiliate-program` on the anchor, a data-attribute contract for a consumer's own click-tracking wiring (see `@vdaluz/astro-opt-in-analytics`'s `bindAffiliateClickTracking()`).

## [0.5.1] - 2026-07-25

### Added

- `AffiliateLink.astro` gained an optional `channel` prop, forwarded to `resolveAffiliate`, so non-markdown pages (e.g. gear pages) can target a per-channel tag/link the same way markdown links and rewrites already can.

## [0.5.0] - 2026-07-25

### Added

- Optional `domain` field on `amazon`-kind programs, for locale-specific Amazon marketplaces (e.g. `www.amazon.com.br`) that need their own Associates tag. Defaults to `www.amazon.com`.
- CLAUDE.md, matching the sibling `@vdaluz/*` packages' conventions.

### Fixed

- `buildChannelRewriteMap` now also maps the HTML-escaped variant of a default URL (`&` as `&amp;`) to the escaped channel URL - a default URL with more than one query param never matched the raw map key in prerendered HTML, silently keeping the default tag on reposts.

### Documentation

- Documented the `Localized` disclosure form and `AffiliateDisclosure`'s `locale` prop, previously implemented but never mentioned in the README.

## [0.4.2] - 2026-07-25

### Added

- `repository`, `homepage`, `bugs`, and `keywords` fields to `package.json` for GitHub/npm discoverability, plus `sideEffects: false` (the package is a pure re-export entry point).
- This CHANGELOG, backfilled from tag history.

## [0.4.1] - 2026-07-25

### Fixed

- `AffiliateDisclosure` now throws on an unknown program name instead of silently skipping it.

### Changed

- Reframed the README around the general problem solved (FTC-compliant disclosure enforced at build time) instead of internal framing, added a Contributing section.

### Added

- CI (typecheck + tests) via GitHub Actions.

## [0.4.0] - 2026-07-18

### Added

- Per-channel affiliate tags, for reposts and syndication.

### Changed

- Linked the Consumers list back to vdaluz.com and imperfectsystems.com in the README.

## [0.3.0] - 2026-07-12

### Added

- Locale-aware disclosure text for i18n consumers.

## [0.2.2] - 2026-07-10

### Changed

- Fixed the `remarkPlugins` usage example in the README (tuple form, not pre-invoked).

## [0.2.1] - 2026-07-10

### Added

- Optional `category` field on catalog entries.

## [0.2.0] - 2026-07-10

### Fixed

- Matched the approved catalog API shape (flat catalog, not nested items).

## [0.1.0] - 2026-07-10

### Added

- Initial release: affiliate catalog resolver and disclosure components.
