// Node-only loader: YAML or JSON shot list -> validated ShotList (zod, see types.ts).
//   import { loadShotList } from './beat-grid/load-shotlist.mjs';
//   const { shotList, warnings, file } = loadShotList('beat-grid/example/shotlist.yaml');
// Compositions can't read YAML at bundle time: import a JSON shot list and call parseShotList()
// (write one with `node beat-grid/make-beats.mjs --from-shotlist x.yaml --out x.json`).
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { parseShotList } from './types.ts';

export const TOOLKIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CATALOG = path.join(TOOLKIT_ROOT, 'public', 'sfx', 'catalog.json');

export const readStructured = (file) => {
  const txt = readFileSync(file, 'utf8');
  return /\.ya?ml$/i.test(file) ? YAML.parse(txt) : JSON.parse(txt);
};

export const sfxIds = () => (existsSync(CATALOG) ? JSON.parse(readFileSync(CATALOG, 'utf8')).sounds.map((s) => s.id) : undefined);

/**
 * @param {string} file .yaml/.yml/.json
 * @param {{ quiet?: boolean, strict?: boolean }} [opts]
 * @returns {{ shotList: import('./types.ts').ShotList, warnings: string[], errors: string[], file: string, beatsPath?: string }}
 */
export function loadShotList(file, opts = {}) {
  const abs = path.resolve(file);
  const res = parseShotList(readStructured(abs), { sfxIds: sfxIds(), strict: false });
  if (!opts.quiet) for (const w of res.warnings) console.warn(`  warn: ${w}`);
  if ((opts.strict ?? true) && res.errors.length)
    throw new Error(`shot list "${res.shotList.id}" (${path.basename(abs)}) invalid:\n  - ${res.errors.join('\n  - ')}`);
  const beatsPath = res.shotList.beatsFile ? path.resolve(path.dirname(abs), res.shotList.beatsFile) : undefined;
  return { ...res, file: abs, beatsPath };
}
