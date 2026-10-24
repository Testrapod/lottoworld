import { renderBalls, message } from './site.js';
import { generateNumbers, inverseWeights, ballColor } from './lotto.js';
import { loadData, showDataStatus, showDataError } from './data.js';
const rows = document.getElementById('generated-rows');
const save = document.getElementById('make_img_btn');
let generated = [];
document.getElementById('make_lotto_btn').addEventListener('click', () => {
  const count = Number(document.getElementById('select_lotto_count').value);
  generated = Array.from({ length: count }, () => generateNumbers());
  const fragment = document.createDocumentFragment();
  generated.forEach((numbers, i) => {
    const row = document.createElement('div'); row.className = 'generated-row';
    const label = document.createElement('span'); label.className = 'row-label'; label.textContent = String.fromCharCode(65 + i);
    const group = document.createElement('div'); group.className = 'balls small-balls'; renderBalls(group, numbers);
    row.append(label, group); fragment.append(row);
  });
  rows.replaceChildren(fragment); save.disabled = false; message('generator-status', `${count}세트 번호를 생성했습니다.`);
});
save.addEventListener('click', async () => {
  if (!generated.length) return;
  save.disabled = true;
  try {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = (120 + generated.length * 78) * 2;
    const ctx = canvas.getContext('2d'); ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#355c7d'; ctx.font = 'bold 28px sans-serif'; ctx.fillText('Lotto World', 36, 52);
    ctx.fillStyle = '#555'; ctx.font = '14px sans-serif'; ctx.fillText('생성한 로또 번호', 36, 83);
    generated.forEach((numbers, i) => {
      const y = 140 + i * 78; ctx.fillStyle = '#355c7d'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(String.fromCharCode(65 + i), 38, y + 7);
      numbers.forEach((number, j) => {
        const x = 114 + j * 80; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fillStyle = ballColor(number); ctx.fill(); ctx.fillStyle = '#17202b';
        ctx.textAlign = 'center'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(String(number), x, y + 7); ctx.textAlign = 'left';
      });
    });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('이미지를 만들지 못했습니다.');
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lotto.png';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('generator-status', '번호 이미지를 저장했습니다.');
  } catch (error) { message('generator-status', error.message, true); }
  finally { save.disabled = false; }
});
try {
  const { counts, metadata } = await loadData(); showDataStatus(metadata);
  for (const [id, weights, label] of [
    ['weighted_random_high_freq_btn', counts, '출현 빈도가 높은 번호 우선'],
    ['weighted_random_low_freq_btn', inverseWeights(counts), '출현 빈도가 낮은 번호 우선'],
  ]) {
    const button = document.getElementById(id); button.disabled = false;
    button.addEventListener('click', () => {
      try {
        renderBalls(document.getElementById('weighted-balls'), generateNumbers(weights));
        message('weighted-state', `${label} · 제${metadata.latestRound}회까지의 통계 기준`);
      } catch (error) { message('weighted-state', error.message, true); }
    });
  }
} catch (error) {
  showDataError(error); message('weighted-state', '통계를 불러오지 못했습니다. 일반 번호 생성은 사용할 수 있습니다.');
}
