# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
