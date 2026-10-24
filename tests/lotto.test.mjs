import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateNumbers, inverseWeights, validateNumbers, validateDraws, validateBundle, numbersOf } from '../js/lotto.js';
import { normalizeOfficial, fetchOfficial, collectDraws, makeBundle } from '../scripts/lotto-source.mjs';
import { readBundle, saveBundle, filenames } from '../scripts/storage.mjs';

const fixture = (await readBundle()).draws.slice(0, 10);
const official = draw => ({
  ltEpsd: draw.drwNo, ltRflYmd: draw.drwNoDate.replaceAll('-', ''),
  wholEpsdSumNtslAmt: draw.totSellamnt, rnk1WnAmt: draw.firstWinamnt,
  rnk1SumWnAmt: draw.firstAccumamnt, rnk1WnNope: draw.firstPrzwnerCo,
  bnsWnNo: draw.bnusNo, ...Object.fromEntries(numbersOf(draw).map((n, i) => [`tm${i + 1}WnNo`, n])),
});
test('historical zero-winner records and current bundle remain valid', async () => {
  assert.equal(fixture[0].firstPrzwnerCo, 0);
  assert.doesNotThrow(() => validateDraws(fixture));
  const bundle = await readBundle();
  assert.equal(bundle.frequency.counts.reduce((a, b) => a + b, 0), bundle.draws.length * 6);
});
test('numbers reject duplicates, zero, fractions, and missing values', () => {
  for (const values of [[1, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], [1.5, 2, 3, 4, 5, 6], [NaN, 2, 3, 4, 5, 6], [1, 2]]) {
    assert.throws(() => validateNumbers(values));
  }
});
test('drawing validation catches missing rounds, impossible dates, bonus collisions and negative amounts', () => {
  for (const change of [d => { d[1].drwNo++; }, d => { d[1].drwNoDate = '2002-12-15'; },
    d => { d[1].bnusNo = d[1].drwtNo1; }, d => { d[1].firstWinamnt = -1; }]) {
    const draws = structuredClone(fixture); change(draws); assert.throws(() => validateDraws(draws));
  }
});
test('normalizes actual provider shape and rejects absent/null fields', () => {
  assert.deepEqual(normalizeOfficial(official(fixture[0])), fixture[0]);
  for (const value of [undefined, null, '', -1, NaN]) {
    const row = official(fixture[0]); row.tm1WnNo = value; assert.throws(() => normalizeOfficial(row));
  }
});
test('official requests reject HTML, malformed lists, HTTP failures and retry transient errors', async () => {
  for (const response of [
    () => new Response('<html>access denied</html>', { headers: { 'content-type': 'text/html' } }),
    () => Response.json({ data: { list: [] } }),
    () => Response.json({}, { status: 503 }),
  ]) await assert.rejects(fetchOfficial('https://example.test', { fetcher: async () => response(), attempts: 1 }));
  let calls = 0;
  const rows = await fetchOfficial('https://example.test', { sleep: async () => {}, fetcher: async () => {
    if (++calls === 1) throw new Error('Temporary network failure');
    return Response.json({ data: { list: [official(fixture[0])] } });
  } });
  assert.equal(calls, 2); assert.equal(rows[0].drwNo, 1);
});
test('collector fills gaps, deduplicates unsorted overlapping pages and is idempotent', async () => {
  const request = async url => url.includes('InfoNew') ? [...fixture].reverse().concat(fixture[0]) : [fixture.at(-1)];
  const result = await collectDraws(fixture.slice(0, 2), { request, sleep: async () => {} });
  assert.deepEqual(result, fixture);
  assert.deepEqual(await collectDraws(result, { request, sleep: async () => {} }), result);
});
test('collector fails closed on official conflicts, unavailable or regressed rounds', async () => {
  const conflict = structuredClone(fixture); conflict[0].firstWinamnt++;
  await assert.rejects(collectDraws(fixture.slice(0, 2), { request: async url => url.includes('InfoNew') ? conflict : [fixture.at(-1)], sleep: async () => {} }), /충돌/);
  await assert.rejects(collectDraws(fixture.slice(0, 2), { request: async () => [fixture.at(-1)], sleep: async () => {} }), /없습니다/);
  await assert.rejects(collectDraws(fixture, { request: async () => [fixture[0]], sleep: async () => {} }), /비정상/);
});
test('bundle catches stale frequency, metadata, and zero counts are safe for inverse weighting', () => {
  const { draws, frequency, metadata } = makeBundle(fixture);
  assert.equal(validateBundle(draws, frequency, metadata).counts.length, 45);
  const invalid = structuredClone(frequency); invalid.counts[0]++;
  assert.throws(() => validateBundle(draws, invalid, metadata));
  assert.throws(() => validateBundle(draws, frequency, { ...metadata, latestRound: 1 }));
  assert.ok(inverseWeights(Array(45).fill(0)).every(Number.isFinite));
});
test('all generators return six unique sorted valid numbers, including boundary RNG values', () => {
  for (const random of [() => 0, () => 1 - Number.EPSILON, Math.random]) {
    for (const weights of [Array(45).fill(1), Array.from({ length: 45 }, (_, i) => i + 1), inverseWeights(Array.from({ length: 45 }, (_, i) => i))]) {
      for (let i = 0; i < 100; i++) {
        const numbers = generateNumbers(weights, random); validateNumbers(numbers);
        assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b));
      }
    }
  }
});
test('empty, invalid and insufficient weights cannot produce zero or loop forever', () => {
  for (const weights of [[], Array(45).fill(0), Array(45).fill(NaN), Array(45).fill(-1), Array(45).fill(Infinity), [1, 1, 1, 1, 1, ...Array(40).fill(0)]]) {
    assert.throws(() => generateNumbers(weights));
  }
  assert.deepEqual(generateNumbers([1, 1, 1, 1, 1, 1, ...Array(39).fill(0)], () => 0), [1, 2, 3, 4, 5, 6]);
});
test('failed validation leaves all existing files intact; repeat writes are byte-identical', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lottoworld-test-'));
  try {
    const bundle = makeBundle(fixture, '2026-10-24T00:00:00Z');
    await saveBundle(bundle, directory);
    const before = await Promise.all(filenames.map(name => readFile(join(directory, name), 'utf8')));
    await assert.rejects(saveBundle({ ...bundle, metadata: { ...bundle.metadata, latestRound: 0 } }, directory));
    assert.deepEqual(await Promise.all(filenames.map(name => readFile(join(directory, name), 'utf8'))), before);
    await saveBundle(bundle, directory);
    assert.deepEqual(await Promise.all(filenames.map(name => readFile(join(directory, name), 'utf8'))), before);
    assert.deepEqual(await readBundle(directory), bundle);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
