import { parseFontFaces } from '../src/index.js';

const CSS = `/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://cdn.onlyfonts.ai/inter/regular.latin.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}
/* latin-ext */
@font-face {
  font-family: 'Inter';
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://cdn.onlyfonts.ai/inter/italic.latin-ext.woff2) format('woff2');
  unicode-range: U+0100-024F;
}`;

describe('parseFontFaces', () => {
  it('parses @font-face blocks into FontFaceData', () => {
    const faces = parseFontFaces(CSS);
    expect(faces).toHaveLength(2);

    expect(faces[0]).toMatchObject({
      weight: 400,
      style: 'normal',
      display: 'swap',
      src: [{ url: 'https://cdn.onlyfonts.ai/inter/regular.latin.woff2', format: 'woff2' }],
    });
    expect(faces[0].unicodeRange).toEqual(['U+0000-00FF', 'U+0131', 'U+0152-0153']);
  });

  it('parses a variable weight range as [min, max]', () => {
    const faces = parseFontFaces(CSS);
    expect(faces[1].weight).toEqual([100, 900]);
    expect(faces[1].style).toBe('italic');
  });

  it('returns [] for css with no @font-face', () => {
    expect(parseFontFaces('body { color: red }')).toEqual([]);
  });
});
