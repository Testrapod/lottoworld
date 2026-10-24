import { validateBundle } from './lotto.js';
let pending;
export function loadData() {
  pending ??= Promise.all(['lotto_data_list.json', 'lotto_freq_list.json', 'metadata.json'].map(async name => {
    const response = await fetch(new URL(`../data/${name}`, import.meta.url), { cache: 'no-cache', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('데이터를 불러오지 못했습니다.'); return response.json();
  })).then(([draws, frequency, metadata]) => validateBundle(draws, frequency, metadata));
  return pending;
}
export function showDataStatus(metadata) {
  const status = document.getElementById('data-status');
  const updated = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(metadata.updatedAt));
  status.textContent = `제${metadata.latestRound}회까지 반영 · 추첨일 ${metadata.drawDate} · 데이터 갱신 ${updated} (한국 시간)`;
  if (Date.now() - Date.parse(`${metadata.drawDate}T20:40:00+09:00`) > 8 * 86400000) {
    status.textContent += ' · 갱신이 지연되고 있습니다. 공식 추첨결과를 확인해주세요.'; status.classList.add('error-message');
  }
}
export function showDataError() {
  const status = document.getElementById('data-status');
  status.textContent = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도하거나 공식 추첨결과를 확인해주세요. ';
  status.classList.add('error-message');
  const retry = document.createElement('button'); retry.className = 'btn btn-outline-secondary btn-sm'; retry.textContent = '다시 불러오기';
  retry.addEventListener('click', () => location.reload()); status.append(retry);
}
