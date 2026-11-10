// Make the installed Analytics SDK available to this unbundled static site.
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const destination = new URL('public/assets/vendor/vercel-analytics/', root);
const sdk = new URL('node_modules/@vercel/analytics/', root);
await mkdir(destination, { recursive: true });
const source = await readFile(new URL('dist/index.mjs', sdk), 'utf8');
await writeFile(new URL('index.mjs', destination), source.replace(/\n\/\/# sourceMappingURL=.*$/, '\n'));
await copyFile(new URL('LICENSE', sdk), new URL('LICENSE', destination));
console.log('Prepared Vercel Web Analytics SDK for the static site.');
