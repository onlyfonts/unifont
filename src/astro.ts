import { onlyfonts as onlyfontsUnifont, type OnlyfontsProviderOptions } from './index.js';
import type { FontFaceData } from 'unifont';

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
  let initialized: InitializedProvider | undefined;

  return {
    name: 'onlyfonts',
    config: options as Record<string, unknown>,
    async init(context) {
      initialized = (await (provider as (ctx: unknown) => unknown)(context)) as InitializedProvider;
    },
    async resolveFont(resolveOptions) {
      const { familyName, ...rest } = resolveOptions ?? {};
      return await initialized?.resolveFont(familyName, rest);
    },
  };
}

export default onlyfonts;

interface InitializedProvider {
  resolveFont(
    family: string,
    options: Record<string, unknown>,
  ): Promise<{ fonts: FontFaceData[] } | undefined> | ({ fonts: FontFaceData[] } | undefined);
}

/**
 * Minimal shape of an Astro Fonts API provider (structurally compatible with
 * Astro's internal `FontProvider`). Parameters are intentionally loose so it
 * assigns to Astro's `FontProvider<never>` regardless of Astro's version.
 */
export interface AstroFontProvider {
  name: string;
  config?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init(context: any): void | Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolveFont(options: any): Promise<{ fonts: FontFaceData[] } | undefined>;
}
