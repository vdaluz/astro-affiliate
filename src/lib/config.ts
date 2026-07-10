import type { AffiliateConfig } from './types';

/**
 * Identity function for authoring a site's affiliate catalog with type checking
 * and editor autocomplete. Use in the consuming app's affiliate config:
 *
 *   import { defineAffiliateConfig } from '@vdaluz/astro-affiliate';
 *
 *   export const affiliateConfig = defineAffiliateConfig({
 *     programs: {
 *       amazon: {
 *         kind: 'amazon',
 *         tag: 'vdaluz-20',
 *         disclosure: 'As an Amazon Associate, I earn from qualifying purchases.',
 *         items: { atomicHabits: 'B07RFSSYBH' },
 *       },
 *       proton: {
 *         kind: 'links',
 *         disclosure: 'As a Proton Partner, I earn from qualifying purchases.',
 *         items: { pass: 'https://go.getproton.me/SH2FI' },
 *       },
 *     },
 *   });
 */
export function defineAffiliateConfig(config: AffiliateConfig): AffiliateConfig {
  return config;
}
