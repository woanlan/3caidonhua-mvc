import { readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

for (const name of ['api', 'app']) {
  const source = await readFile(new URL('../public/ts/' + name + '.ts', import.meta.url), 'utf8');
  const js = stripTypeScriptTypes(source);
  await writeFile(new URL('../public/js/' + name + '.js', import.meta.url), js);
}
console.log('Public JavaScript generated for public/js/.');
