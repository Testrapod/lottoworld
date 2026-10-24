export const numbersOf = draw => Array.from({ length: 6 }, (_, i) => draw[`drwtNo${i + 1}`]);

export function validateNumbers(numbers) {
  if (numbers.length !== 6 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 45)) {
    throw new Error('1~45 사이의 정수 6개를 입력해주세요.');
  }
  if (new Set(numbers).size !== 6) throw new Error('중복된 번호를 사용할 수 없습니다.');
  return numbers;
}

export function validateDraws(draws) {
  if (!Array.isArray(draws) || !draws.length) throw new Error('당첨 기록이 비어 있습니다.');
  draws.forEach((draw, index) => {
    if (draw.drwNo !== index + 1) throw new Error(`회차 누락 또는 중복: ${index + 1}회`);
    const numbers = validateNumbers(numbersOf(draw));
    if (numbers.some((n, i) => i && n <= numbers[i - 1])) throw new Error('당첨번호 정렬 오류');
    if (!Number.isInteger(draw.bnusNo) || draw.bnusNo < 1 || draw.bnusNo > 45 || numbers.includes(draw.bnusNo)) {
      throw new Error(`보너스 번호 오류: ${draw.drwNo}회`);
    }
    const date = new Date(`${draw.drwNoDate}T00:00:00Z`);
    const expected = new Date(Date.UTC(2002, 11, 7) + index * 7 * 86400000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draw.drwNoDate) || !Number.isFinite(+date) || draw.drwNoDate !== expected) {
      throw new Error(`추첨일 오류: ${draw.drwNo}회`);
    }
    for (const field of ['totSellamnt', 'firstAccumamnt', 'firstWinamnt', 'firstPrzwnerCo']) {
      if (!Number.isSafeInteger(draw[field]) || draw[field] < 0) throw new Error(`금액/인원 오류: ${field}`);
    }
  });
  return draws;
}

export function frequenciesOf(draws) {
  const counts = Array(45).fill(0);
  for (const draw of draws) for (const number of numbersOf(draw)) counts[number - 1]++;
  return counts;
}

export function validateBundle(draws, frequency, metadata) {
  validateDraws(draws);
  const latest = draws.at(-1);
  const counts = frequenciesOf(draws);
  if (frequency?.drwNoBy !== latest.drwNo || !Array.isArray(frequency.counts) ||
      frequency.counts.length !== 45 || frequency.counts.some((n, i) => n !== counts[i]) ||
      metadata?.schemaVersion !== 1 || metadata.latestRound !== latest.drwNo ||
      metadata.drawDate !== latest.drwNoDate || metadata.recordCount !== draws.length ||
      !Number.isFinite(Date.parse(metadata.updatedAt))) {
    throw new Error('당첨 기록·통계·갱신 정보가 일치하지 않습니다. 다시 시도해주세요.');
  }
  return { draws, counts, metadata };
}

// Remove each selected candidate: always terminates, even with concentrated weights.
export function generateNumbers(weights = Array(45).fill(1), random = Math.random) {
  if (weights.length !== 45 || weights.some(w => !Number.isFinite(w) || w < 0) ||
      weights.filter(w => w > 0).length < 6 || !Number.isFinite(weights.reduce((a, b) => a + b, 0))) {
    throw new Error('번호 생성에 필요한 통계가 올바르지 않습니다.');
  }
  const candidates = weights.map((weight, i) => ({ number: i + 1, weight }));
  const selected = [];
  for (let i = 0; i < 6; i++) {
    const r = random();
    if (!Number.isFinite(r) || r < 0 || r >= 1) throw new Error('난수 범위 오류');
    const total = candidates.reduce((sum, item) => sum + item.weight, 0);
    const target = r * total;
    let accumulated = 0;
    let index = candidates.findIndex(item => (accumulated += item.weight) > target);
    if (index < 0) index = candidates.findLastIndex(item => item.weight > 0);
    selected.push(candidates.splice(index, 1)[0].number);
  }
  return selected.sort((a, b) => a - b);
}

export function inverseWeights(counts) {
  if (counts.length !== 45 || counts.some(n => !Number.isSafeInteger(n) || n < 0)) {
    throw new Error('빈도 데이터 오류');
  }
  return counts.map(n => 1 / Math.max(1, n));
}

export const ballColor = n => ['#FBC400', '#69C8F2', '#FF7272', '#AAAAAA', '#B0D840'][Math.min(4, Math.floor((n - 1) / 10))];
