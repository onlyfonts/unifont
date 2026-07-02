import { onlyfonts as onlyfontsUnifont, type OnlyfontsProviderOptions } from './index.js';

/**
 * Astro Fonts API adapter for the onlyfonts provider.
 *
 * Astro's (experimental) Fonts API does not consume raw unifont providers — it
 * expects its own `FontProvider` shape (`{ name, init, resolveFont }`) and wraps
 * unifont internally for its built-ins. This adapter wraps the onlyfonts unifont
 * provider into that shape, mirroring Astro's own `fontProviders.google()`.
 *
 * For Nuxt (`@nuxt/fonts`) or any direct unifont consumer, import the raw
 * provider from `@onlyfonts/unifont` instead.
 *
 * @example astro.config.mjs
 * ```ts
 * import { defineConfig, fontProviders } from 'astro/config';
 * import { onlyfonts } from '@onlyfonts/unifont/astro';
 *
 * export default defineConfig({
 *   experimental: {
 *     fonts: [
 *       { provider: onlyfonts(), name: 'Inter', cssVariable: '--font-inter' },
 *       { provider: fontProviders.local(), name: 'Berkeley Mono', cssVariable: '--font-mono',
 *         variants: [{ weight: 400, style: 'normal', src: ['./public/fonts/BerkeleyMono-Regular.woff2'] }] },
 *     ],
 *   },
 * });
 * ```
 */
export function onlyfonts(options: OnlyfontsProviderOptions = {}): AstroFontProvider {
  const provider = onlyfontsUnifont(options);
  let initialized: { resolveFont: InitializedResolveFont } | undefined;

  return {
    name: 'onlyfonts',
    config: options as Record<string, unknown>,
    async init(context: unknown) {
      initialized = (await (provider as (ctx: unknown) => unknown)(context)) as typeof initialized;
    },
    async resolveFont({ familyName, ...rest }: AstroResolveFontOptions) {
      return await initialized?.resolveFont(familyName, rest);
    },
  };
}

export default onlyfonts;

type InitializedResolveFont = (
  family: string,
  options: Record<string, unknown>,
) => Promise<{ fonts: unknown[] } | undefined> | ({ fonts: unknown[] } | undefined);

interface AstroResolveFontOptions {
  familyName: string;
  [key: string]: unknown;
}

/** Minimal shape of an Astro Fonts API provider (mirrors Astro's internal `FontProvider`). */
export interface AstroFontProvider {
  name: string;
  config?: Record<string, unknown>;
  init(context: unknown): Promise<void>;
  resolveFont(options: AstroResolveFontOptions): Promise<{ fonts: unknown[] } | undefined>;
}
