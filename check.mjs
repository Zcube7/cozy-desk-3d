// Syntax-check every game module; the deploy workflow runs this before publishing.
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = readdirSync('dist/js').filter(f => f.endsWith('.js'));
for (const file of files) execFileSync(process.execPath, ['--check', `dist/js/${file}`], { stdio: 'inherit' });
console.log(`checked ${files.length} modules`);
