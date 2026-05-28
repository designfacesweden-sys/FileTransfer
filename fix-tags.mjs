import { readFileSync, writeFileSync } from 'node:fs';

const path = 'apps/web/src/routes/+page.svelte';
const bad = '</' + 'motion>';
const good = '</div>';
let s = readFileSync(path, 'utf8');
s = s.split(bad).join(good);
writeFileSync(path, s);
console.log('fixed', (s.match(/<\/div>/g) || []).length, 'div closers');
