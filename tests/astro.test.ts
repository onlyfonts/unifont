import { onlyfonts } from '../src/astro.js';

describe('astro adapter', () => {
  it('returns an Astro-shaped FontProvider', () => {
    const p = onlyfonts();
    expect(p.name).toBe('onlyfonts');
    expect(typeof p.init).toBe('function');
    expect(typeof p.resolveFont).toBe('function');
  });

  it('carries options as config (used by Astro for dedup)', () => {
    const p = onlyfonts({ base: 'https://cdn.example.com' });
    expect(p.config).toEqual({ base: 'https://cdn.example.com' });
  });

  it('resolveFont before init resolves to undefined (no crash)', async () => {
    const p = onlyfonts();
    await expect(p.resolveFont({ familyName: 'Inter', weights: ['400'], styles: ['normal'] })).resolves.toBeUndefined();
  });
});
