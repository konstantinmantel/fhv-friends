import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('mobile-preview.html', 'dist/mobile-preview.html');
await cp('src', 'dist/src', { recursive: true });
await cp('public', 'dist', { recursive: true });
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new Error('Invalid Supabase project URL');
  if (key.startsWith('sb_secret_')) throw new Error('Secret keys cannot be published');
  if (key.startsWith('ey')) { const p = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')); if (p.role !== 'anon') throw new Error('Only anon keys can be published'); }
  await writeFile('dist/config.js', `window.FHV_CONFIG = Object.freeze(${JSON.stringify({supabaseUrl:url,supabaseKey:key})});\n`);
}
console.log('Built FHV Friends → ' + resolve('dist'));
