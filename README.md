# @onlyfonts/unifont

[![Subscribers](https://onlyfonts.tinysend.com/subscribers.svg)](https://onlyfonts.tinysend.com)

[unifont](https://github.com/unjs/unifont) provider for [onlyfonts](https://onlyfonts.ai) — serve open-source fonts from onlyfonts' privacy-first, EU-hosted, Google-Fonts-compatible CDN in Astro, Nuxt, and anything built on unifont. No visitor tracking, no requests to Google.

## Install

```bash
npm install @onlyfonts/unifont
```

## Astro

Astro's Fonts API uses its own provider shape, so import the adapter from `@onlyfonts/unifont/astro`:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { onlyfonts } from '@onlyfonts/unifont/astro';

export default defineConfig({
  experimental: {
    fonts: [
      { provider: onlyfonts(), name: 'Inter', cssVariable: '--font-inter' },
    ],
  },
});
```

```astro
---
// in your layout
import { Font } from 'astro:fonts';
---
<Font cssVariable="--font-inter" preload />
```

```css
body { font-family: var(--font-inter); }
```

Fonts that aren't in the onlyfonts catalog (e.g. a licensed font you self-host) can be
registered alongside via Astro's built-in `local` provider — providers coexist per family.

## Nuxt

```ts
// nuxt.config.ts
import { onlyfonts } from '@onlyfonts/unifont';

export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  fonts: {
    providers: { onlyfonts },
    families: [{ name: 'Inter', provider: 'onlyfonts' }],
  },
});
```

## Options

```ts
onlyfonts({ base: 'https://cdn.onlyfonts.ai' }) // override the CDN base (e.g. a custom domain)
```

## How it works

The provider resolves each family against the onlyfonts `css2` endpoint (the same URL format as `fonts.googleapis.com/css2`) and returns the `@font-face` data — including per-subset `unicode-range` — to unifont. Fonts are served as woff2 from Cloudflare's EU edge. Every font in the onlyfonts catalog is open-source (OFL / Apache).

## License

MIT
