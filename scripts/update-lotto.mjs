import { fileURLToPath } from 'node:url';
import { appendFile } from 'node:fs/promises';
import { collectDraws, makeBundle } from './lotto-source.mjs';
import { readBundle, saveBundle, DATA_DIR } from './storage.mjs';

try {
  if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('지원 옵션: --check');
  const previous = await readBundle();
  const draws = await collectDraws(previous.draws);
  const changed = draws.length !== previous.draws.length;
  const bundle = changed ? makeBundle(draws) : previous;
  if (changed && !process.argv.includes('--check')) await saveBundle(bundle, fileURLToPath(DATA_DIR));
  const message = `${changed ? '신규 데이터' : '변경 없음'}: ${draws.at(-1).drwNo}회 (${draws.at(-1).drwNoDate}), ${draws.length}개 기록`;
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
} catch (error) {
  console.error(`갱신 실패 — 기존 데이터 유지: ${error.message}`);
  process.exitCode = 1;
}
