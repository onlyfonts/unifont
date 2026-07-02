import { defineFontProvider, type FontFaceData, type ProviderContext } from 'unifont';

const DEFAULT_BASE = 'https://cdn.onlyfonts.ai';

export interface OnlyfontsProviderOptions {
  /**
   * Override the onlyfonts CDN base URL.
   * @default 'https://cdn.onlyfonts.ai'
   */
  base?: string;
}

/**
 * unifont provider for onlyfonts.
 *
 * onlyfonts serves open-source fonts from a Google-Fonts-compatible, EU-hosted
 * CDN with no visitor tracking. This provider resolves a font family against
 * the onlyfonts `css2` endpoint and hands the resulting @font-face data to
 * unifont — so it works in Astro's Fonts API, Nuxt's @nuxt/fonts, and anything
 * else built on unifont.
 *
 * @example Astro
 * ```ts
 * import { onlyfonts } from '@onlyfonts/unifont'
 * export default defineConfig({
 *   experimental: {
 *     fonts: [{ provider: onlyfonts(), name: 'Inter', cssVariable: '--font-inter' }],
 *   },
 * })
 * ```
 */
export const onlyfonts = defineFontProvider(
  'onlyfonts',
  (options: OnlyfontsProviderOptions = {}, ctx: ProviderContext) => {
    const base = (options.base ?? DEFAULT_BASE).replace(/\/+$/, '');

    return {
      async resolveFont(family: string, { weights, styles }: { weights: string[]; styles: string[] }) {
        const url = buildCss2Url(base, family, weights, styles);

        const css = await ctx.storage.getItem<string | null>(
          `onlyfonts:${url}`,
          async () => {
            const res = await fetch(url);
            return res.ok ? await res.text() : null;
          },
        );

        if (!css) return undefined;
        const fonts = parseFontFaces(css);
        if (fonts.length === 0) return undefined;
        return { fonts };
      },
    };
  },
);

export default onlyfonts;

/** Build a Google-Fonts-compatible css2 URL against the onlyfonts CDN. */
function buildCss2Url(base: string, family: string, weights: string[], styles: string[]): string {
  const wghts = weights.length > 0 ? [...weights] : ['400'];
  const wantItalic = styles.includes('italic');
  const wantNormal = styles.includes('normal') || !wantItalic;

  let axis: string;
  if (wantItalic) {
    // css2 requires ital,wght tuples sorted ascending: "0,400;0,700;1,400;1,700"
    const tuples: string[] = [];
    if (wantNormal) for (const w of wghts) tuples.push(`0,${w}`);
    for (const w of wghts) tuples.push(`1,${w}`);
    tuples.sort(compareTuples);
    axis = `ital,wght@${tuples.join(';')}`;
  } else {
    const sorted = [...new Set(wghts)].sort((a, b) => weightKey(a) - weightKey(b));
    axis = `wght@${sorted.join(';')}`;
  }

  return `${base}/css2?family=${encodeURIComponent(family)}:${axis}&display=swap`;
}

function compareTuples(a: string, b: string): number {
  const [ai, aw] = a.split(',');
  const [bi, bw] = b.split(',');
  return ai === bi ? weightKey(aw) - weightKey(bw) : Number(ai) - Number(bi);
}

/** Weight can be a number ("400") or a variable range ("100..900") — sort by the low end. */
function weightKey(w: string): number {
  return Number(w.split('..')[0]) || 0;
}

/** Parse @font-face blocks from css2 output into unifont FontFaceData. */
export function parseFontFaces(css: string): FontFaceData[] {
  const faces: FontFaceData[] = [];
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];

  for (const block of blocks) {
    const src = grab(block, 'src')?.match(/url\(\s*([^)\s]+)\s*\)/)?.[1];
    if (!src) continue;

    const style = grab(block, 'font-style');
    const weightRaw = grab(block, 'font-weight');
    const unicode = grab(block, 'unicode-range');

    let weight: string | number | [number, number] | undefined;
    if (weightRaw) {
      const nums = weightRaw.split(/\s+/).map(Number).filter((n) => !Number.isNaN(n));
      weight = nums.length === 2 ? [nums[0], nums[1]] : (nums[0] ?? weightRaw);
    }

    faces.push({
      src: [{ url: src.replace(/['"]/g, ''), format: 'woff2' }],
      display: 'swap',
      ...(weight != null ? { weight } : {}),
      ...(style ? { style } : {}),
      ...(unicode ? { unicodeRange: unicode.split(',').map((s) => s.trim()) } : {}),
    });
  }

  return faces;
}

function grab(block: string, prop: string): string | undefined {
  return new RegExp(`${prop}\\s*:\\s*([^;]+);`).exec(block)?.[1]?.trim();
}
