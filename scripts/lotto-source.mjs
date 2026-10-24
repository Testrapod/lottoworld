import { validateDraws, frequenciesOf, validateBundle } from '../js/lotto.js';

export const SOURCE = 'https://www.dhlottery.co.kr';
export function normalizeOfficial(row) {
  const value = field => {
    const raw = row?.[field];
    if (raw === null || raw === undefined || raw === '' || typeof raw === 'boolean') throw new Error(`필드 누락: ${field}`);
    const number = Number(raw);
    if (!Number.isSafeInteger(number) || number < 0) throw new Error(`잘못된 필드: ${field}`);
    return number;
  };
  const date = String(row?.ltRflYmd ?? '');
  if (!/^\d{8}$/.test(date)) throw new Error('공식 추첨일 형식 오류');
  return {
    totSellamnt: value('wholEpsdSumNtslAmt'), returnValue: 'success',
    drwNoDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
    firstWinamnt: value('rnk1WnAmt'), firstAccumamnt: value('rnk1SumWnAmt'),
    firstPrzwnerCo: value('rnk1WnNope'), drwNo: value('ltEpsd'),
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`drwtNo${i + 1}`, value(`tm${i + 1}WnNo`)])),
    bnusNo: value('bnsWnNo'),
  };
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function fetchOfficial(url, { fetcher = fetch, sleep = pause, attempts = 3 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetcher(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'LottoWorld-DataUpdater/2.0' },
        signal: AbortSignal.timeout(15000), redirect: 'error',
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`공식 데이터 응답 오류: HTTP ${response.status}`);
      }
      const body = await response.json();
      if (!Array.isArray(body?.data?.list) || !body.data.list.length) throw new Error('공식 회차 목록이 없습니다.');
      return body.data.list.map(normalizeOfficial);
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
}

export async function collectDraws(existing, { request = fetchOfficial, sleep = pause } = {}) {
  validateDraws(existing);
  const latestRows = await request(`${SOURCE}/lt645/selectPstLt645Info.do`);
  const latest = Math.max(...latestRows.map(row => row.drwNo));
  const last = existing.at(-1).drwNo;
  if (!Number.isSafeInteger(latest) || latest < last || latest > last + 1000) throw new Error('공식 최신 회차가 비정상입니다.');
  const records = new Map(existing.map(draw => [draw.drwNo, draw]));
  const merge = rows => {
    for (const row of rows) {
      if (row.drwNo > latest) continue;
      const previous = records.get(row.drwNo);
      if (previous && Object.keys(row).some(key => row[key] !== previous[key])) {
        throw new Error(`공식 데이터와 저장 기록 충돌: ${row.drwNo}회. 수동 검토가 필요합니다.`);
      }
      records.set(row.drwNo, previous ?? row);
    }
  };
  merge(latestRows);
  // Always overlap the last saved draw to detect corrections.
  await sleep(350);
  merge(await request(`${SOURCE}/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=${last}`));
  for (let round = last + 1; round <= latest; round++) {
    if (records.has(round)) continue;
    await sleep(350);
    merge(await request(`${SOURCE}/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=${round}`));
    if (!records.has(round)) throw new Error(`공식 응답에 ${round}회가 없습니다.`);
  }
  const draws = [...records.values()].sort((a, b) => a.drwNo - b.drwNo);
  validateDraws(draws);
  if (draws.at(-1).drwNo !== latest) throw new Error('최신 회차 누락');
  if (Date.parse(`${draws.at(-1).drwNoDate}T11:00:00Z`) > Date.now()) throw new Error('아직 추첨하지 않은 미래 데이터입니다.');
  return draws;
}

export function makeBundle(draws, updatedAt = new Date().toISOString()) {
  validateDraws(draws);
  const latest = draws.at(-1);
  const frequency = { drwNoBy: latest.drwNo, counts: frequenciesOf(draws) };
  const metadata = { schemaVersion: 1, latestRound: latest.drwNo, drawDate: latest.drwNoDate,
    recordCount: draws.length, updatedAt, source: `${SOURCE}/lt645/result` };
  validateBundle(draws, frequency, metadata);
  return { draws, frequency, metadata };
}
