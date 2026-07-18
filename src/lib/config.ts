import type { AffiliateConfig } from './types.ts';

/**
 * Identity function for authoring a site's affiliate config with type checking
 * and editor autocomplete. Use in the consuming app's affiliate config:
 *
 *   import { defineAffiliateConfig } from '@vdaluz/astro-affiliate';
 *
 *   export const affiliate = defineAffiliateConfig({
 *     programs: {
 *       amazon: {
 *         kind: 'amazon',
 *         tag: 'vdaluz-20',
 *         disclosure: 'As an Amazon Associate, I earn from qualifying purchases.',
 *       },
 *       proton: {
 *         kind: 'links',
 *         disclosure: 'As a Proton Partner, I earn from qualifying purchases.',
 *         links: { pass: 'https://go.getproton.me/SH2FI' },
 *       },
 *     },
 *     catalog: {
 *       atomicHabits: { program: 'amazon', asin: 'B07RFSSYBH' },
 *       protonPass: { program: 'proton', link: 'pass' },
 *     },
 *   });
 */
export function defineAffiliateConfig(config: AffiliateConfig): AffiliateConfig {
  return config;
}
