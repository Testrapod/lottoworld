import { renderBalls, message } from './site.js';
import { generateNumbers, numbersOf } from './lotto.js';
import { loadData, showDataStatus, showDataError } from './data.js';
import './kakao_map.js';
const balls = document.getElementById('winning-balls');
const restore = document.getElementById('restore-winning-btn');
let latest;
let showingGenerated = false;
function showWinning() {
  showingGenerated = false;
  renderBalls(balls, numbersOf(latest), latest.bnusNo);
  message('number-state', `제${latest.drwNo}회 당첨번호 · ${latest.drwNoDate} 추첨`);
  restore.hidden = true;
}
document.getElementById('make_lotto_btn').addEventListener('click', () => {
  showingGenerated = true;
  renderBalls(balls, generateNumbers()); message('number-state', '새로 생성한 번호'); restore.hidden = !latest;
});
restore.addEventListener('click', showWinning);
try {
  const { draws, metadata } = await loadData(); latest = draws.at(-1);
  showDataStatus(metadata);
  if (showingGenerated) restore.hidden = false;
  else showWinning();
  message('latest_winning_money', `${latest.firstWinamnt.toLocaleString('ko-KR')}원`);
  message('latest_winning_details', `1등 ${latest.firstPrzwnerCo}명 · 총 당첨금 ${latest.firstAccumamnt.toLocaleString('ko-KR')}원`);
  message('latest_winning_date', `${latest.drwNoDate} 추첨 · 제${latest.drwNo}회`);
} catch (error) {
  showDataError(error);
  if (!showingGenerated) message('number-state', '당첨번호를 불러올 수 없습니다');
}
