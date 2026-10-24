import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { readBundle, filenames } from './storage.mjs';
import { config } from '../js/config.js';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DIST = join(ROOT, 'dist');
try { process.loadEnvFile(join(ROOT, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const settings = {
  ...config,
  kakaoMapJavaScriptKey: process.env.KAKAO_MAP_JAVASCRIPT_KEY ?? config.kakaoMapJavaScriptKey,
  giscus: {
    repo: process.env.GISCUS_REPO || config.giscus.repo,
    repoId: process.env.GISCUS_REPO_ID || config.giscus.repoId,
    category: process.env.GISCUS_CATEGORY || config.giscus.category,
    categoryId: process.env.GISCUS_CATEGORY_ID || config.giscus.categoryId,
  },
};
if (settings.kakaoMapJavaScriptKey && !/^[a-f0-9]{32}$/i.test(settings.kakaoMapJavaScriptKey)) throw new Error('카카오 JavaScript 키 형식 오류');
if (!/^[\w.-]+\/[\w.-]+$/.test(settings.giscus.repo)) throw new Error('giscus 저장소 형식 오류');
const fields = [settings.giscus.repoId, settings.giscus.category, settings.giscus.categoryId];
if (fields.some(Boolean) && !fields.every(Boolean)) throw new Error('giscus 저장소 ID·카테고리·카테고리 ID를 함께 설정해주세요.');
await readBundle();
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
// Publish only browser assets, never the repository root or .env files.
for (const name of ['index.html', 'make_lotto.html', 'lotto_statistic.html', 'comment.html', 'css', 'js', 'favicon_io']) {
  await cp(join(ROOT, name), join(DIST, name), { recursive: true, filter: source => !source.endsWith('.DS_Store') });
}
await mkdir(join(DIST, 'data'));
for (const name of filenames) await cp(join(ROOT, 'data', name), join(DIST, 'data', name));
await writeFile(join(DIST, 'js/config.js'), `// Public browser configuration.\nexport const config = ${JSON.stringify(settings, null, 2)};\n`);
await writeFile(join(DIST, '.nojekyll'), '');
for (const name of ['index.html', 'make_lotto.html', 'lotto_statistic.html', 'comment.html']) {
  const html = await readFile(join(DIST, name), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`중복 HTML ID: ${name}`);
  for (const [, target] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(target)) continue;
    await readFile(resolve(DIST, target));
  }
}
for (const name of await readdir(join(DIST, 'js'))) {
  const source = await readFile(join(DIST, 'js', name), 'utf8');
  for (const [, target] of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    await readFile(resolve(dirname(join(DIST, 'js', name)), target));
  }
}
console.log(`배포 파일 준비 완료: ${DIST}`);
