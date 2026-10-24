import { readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBundle } from '../js/lotto.js';

export const DATA_DIR = new URL('../data/', import.meta.url);
export const filenames = ['lotto_data_list.json', 'lotto_freq_list.json', 'metadata.json'];
export const stringify = value => Array.isArray(value)
  ? '[\n' + value.map(row => '  ' + JSON.stringify(row)).join(',\n') + '\n]\n'
  : JSON.stringify(value, null, 2) + '\n';
export async function readBundle(directory = DATA_DIR) {
  const base = directory instanceof URL ? directory : pathToFileURL(directory + '/');
  const [draws, frequency, metadata] = await Promise.all(filenames.map(name => readFile(new URL(name, base), 'utf8').then(JSON.parse)));
  validateBundle(draws, frequency, metadata);
  return { draws, frequency, metadata };
}

// All validation and staging finishes before replacing files. Roll back on I/O failure.
export async function saveBundle(bundle, directory) {
  validateBundle(bundle.draws, bundle.frequency, bundle.metadata);
  const values = [bundle.draws, bundle.frequency, bundle.metadata].map(stringify);
  await mkdir(directory, { recursive: true });
  const previous = await Promise.all(filenames.map(name => readFile(join(directory, name)).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  })));
  const temporary = filenames.map(name => join(directory, `${name}.${process.pid}.tmp`));
  try {
    await Promise.all(temporary.map((path, i) => writeFile(path, values[i], { flag: 'wx' })));
    for (let i = 0; i < filenames.length; i++) await rename(temporary[i], join(directory, filenames[i]));
  } catch (error) {
    for (let i = 0; i < filenames.length; i++) {
      if (previous[i] === null) await rm(join(directory, filenames[i]), { force: true });
      else await writeFile(join(directory, filenames[i]), previous[i]);
    }
    throw error;
  } finally {
    await Promise.all(temporary.map(path => rm(path, { force: true })));
  }
}
