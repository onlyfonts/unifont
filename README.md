# @onlyfonts/unifont

[![Subscribers](https://onlyfonts.tinysend.com/subscribers.svg)](https://onlyfonts.tinysend.com)

[unifont](https://github.com/unjs/unifont) provider for [onlyfonts](https://onlyfonts.ai) — serve open-source fonts from onlyfonts' privacy-first, EU-hosted, Google-Fonts-compatible CDN in Astro, Nuxt, and anything built on unifont. No visitor tracking, no requests to Google.

## Install

```bash
npm install @onlyfonts/unifont
```

## Astro

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { onlyfonts } from '@onlyfonts/unifont';

export default defineConfig({
  experimental: {
    fonts: [
      { provider: onlyfonts(), name: 'Inter', cssVariable: '--font-inter' },
    ],
  },
});
```

```css
body { font-family: var(--font-inter); }
```

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
