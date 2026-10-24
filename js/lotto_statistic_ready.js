import { renderBalls, message } from './site.js';
import { numbersOf, validateNumbers, ballColor } from './lotto.js';
import { loadData, showDataStatus, showDataError } from './data.js';
const select = document.getElementById('select_lotto_number');
try {
  const { draws, counts, metadata } = await loadData(); showDataStatus(metadata);
  const byRound = new Map(draws.map(draw => [draw.drwNo, draw]));
  const fragment = document.createDocumentFragment();
  [...draws].reverse().forEach(draw => {
    const option = document.createElement('option'); option.value = draw.drwNo; option.textContent = `${draw.drwNo}회`; fragment.append(option);
  });
  select.replaceChildren(fragment); select.disabled = false;
  const showDraw = () => {
    const draw = byRound.get(Number(select.value));
    renderBalls(document.getElementById('history-balls'), numbersOf(draw), draw.bnusNo);
    message('select_lotto_date', `${draw.drwNoDate} 추첨`);
  };
  showDraw(); select.addEventListener('change', showDraw);
  const search = document.getElementById('search_lotto_btn'); search.disabled = false; search.addEventListener('click', showDraw);
  const chart = document.getElementById('number_frequency_chart'); const max = Math.max(...counts);
  const bars = document.createDocumentFragment();
  counts.forEach((count, i) => {
    const row = document.createElement('div'); row.className = 'frequency-row';
    const label = document.createElement('span'); label.textContent = `${i + 1}번`;
    const track = document.createElement('div'); track.className = 'frequency-track';
    const bar = document.createElement('div'); bar.className = 'frequency-bar';
    bar.style.width = `${count / max * 100}%`; bar.style.backgroundColor = ballColor(i + 1); track.append(bar);
    const value = document.createElement('span'); value.textContent = `${count}회`; row.append(label, track, value); bars.append(row);
  });
  chart.replaceChildren(bars);
  message('frequency-caption', `1~${metadata.latestRound}회 본번호 출현 횟수 · 보너스 제외 · 막대 길이는 0회 기준`);
  const form = document.getElementById('analysis-form'); document.getElementById('number_analysis_btn').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const inputs = [...form.querySelectorAll('input')];
      const numbers = validateNumbers(inputs.map(input => input.value.trim() === '' ? NaN : Number(input.value)));
      const selected = new Set(numbers); const tbody = document.querySelector('#number_analysis_table tbody');
      const results = document.createDocumentFragment(); let matches = 0;
      for (const draw of [...draws].reverse()) {
        const drawn = numbersOf(draw); const count = drawn.filter(n => selected.has(n)).length;
        if (count < 3) continue;
        matches++; const row = document.createElement('tr');
        const round = document.createElement('th'); round.scope = 'row'; round.textContent = `${draw.drwNo}회`;
        const cell = document.createElement('td');
        drawn.forEach((number, i) => {
          const span = document.createElement('span'); span.textContent = String(number);
          if (selected.has(number)) { span.className = 'matched-number'; span.setAttribute('aria-label', `일치 ${number}`); }
          if (i) cell.append(', '); cell.append(span);
        });
        const total = document.createElement('td'); total.textContent = `${count}개`; row.append(round, cell, total); results.append(row);
      }
      tbody.replaceChildren(results); document.getElementById('number_analysis_table').hidden = !matches;
      message('analysis-status', matches ? `본번호 3개 이상 일치하는 회차 ${matches}건입니다.` : '본번호 3개 이상 일치하는 회차가 없습니다.');
    } catch (error) {
      document.getElementById('number_analysis_table').hidden = true; message('analysis-status', error.message, true);
    }
  });
} catch (error) {
  showDataError(error); select.options[0].textContent = '데이터 불러오기 실패';
}
