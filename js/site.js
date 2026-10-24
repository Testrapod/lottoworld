import { ballColor } from './lotto.js';

export const links = {
  home: 'https://www.dhlottery.co.kr/', buy: 'https://www.dhlottery.co.kr/userGuide',
  intro: 'https://www.dhlottery.co.kr/lt645/intro', result: 'https://www.dhlottery.co.kr/lt645/result',
  stores: 'https://www.dhlottery.co.kr/prchsplcsrch/home', map: 'https://map.kakao.com/link/search/%EB%A1%9C%EB%98%90',
};
const nav = document.getElementById('navi');
if (nav) {
  const items = [['index.html', '홈'], ['make_lotto.html', '로또 번호 생성기'], ['lotto_statistic.html', '로또 통계'], ['comment.html', '댓글달기']];
  const active = location.pathname.split('/').at(-1) || 'index.html';
  const list = document.createElement('ul'); list.className = 'nav nav-pills justify-content-center';
  for (const [url, label] of items) {
    const li = document.createElement('li'); const a = document.createElement('a');
    a.href = url; a.className = `nav-link${active === url ? ' active' : ''}`; a.textContent = label;
    if (active === url) a.setAttribute('aria-current', 'page'); li.append(a); list.append(li);
  }
  const extra = document.createElement('li'); extra.className = 'nav-extra';
  const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = '더보기';
  const menu = document.createElement('div'); menu.className = 'external-menu';
  for (const [key, text] of [['buy', '로또 구매 안내'], ['home', '동행복권 홈페이지'], ['stores', '공식 판매점 찾기']]) {
    const a = document.createElement('a'); a.href = links[key]; a.textContent = text; a.target = '_blank'; a.rel = 'noopener noreferrer'; menu.append(a);
  }
  details.append(summary, menu); extra.append(details); list.append(extra); nav.replaceChildren(list);
}
document.querySelectorAll('[data-link]').forEach(a => { if (links[a.dataset.link]) a.href = links[a.dataset.link]; });
const footer = document.querySelector('footer');
if (footer) footer.innerHTML = '<p>번호 생성과 통계는 선택을 돕는 참고 기능입니다. 과거 출현 빈도는 다음 추첨의 당첨 확률을 높이지 않습니다.</p><p>데이터 출처: <a href="https://www.dhlottery.co.kr/lt645/result" target="_blank" rel="noopener noreferrer">동행복권</a> · <a href="https://github.com/Testrapod/lottoworld">GitHub</a></p>';

export function renderBalls(container, numbers, bonus) {
  const fragment = document.createDocumentFragment();
  for (const n of numbers) {
    const ball = document.createElement('span'); ball.className = 'number-ball'; ball.textContent = n; ball.style.backgroundColor = ballColor(n); fragment.append(ball);
  }
  if (bonus !== undefined) {
    const plus = document.createElement('span'); plus.className = 'bonus-plus'; plus.textContent = '+';
    const ball = document.createElement('span'); ball.className = 'number-ball bonus-ball'; ball.textContent = bonus;
    ball.style.backgroundColor = ballColor(bonus); ball.setAttribute('aria-label', `보너스 ${bonus}`); fragment.append(plus, ball);
  }
  container.replaceChildren(fragment);
}
export function message(id, text, isError = false) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = text; el.classList.toggle('error-message', isError);
}
