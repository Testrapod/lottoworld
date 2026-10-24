import './site.js';
import { config } from './config.js';
const { repo, repoId, category, categoryId } = config.giscus;
const fallback = document.getElementById('discussion-link');
fallback.href = `https://github.com/${repo}/discussions`;
const status = document.getElementById('comment-status');
if (repoId && category && categoryId) {
  const script = document.createElement('script'); script.src = 'https://giscus.app/client.js'; script.async = true; script.crossOrigin = 'anonymous';
  const attributes = {
    repo, 'repo-id': repoId, category, 'category-id': categoryId, mapping: 'specific', term: 'Lotto World 방명록',
    strict: '1', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: 'light', lang: 'ko', loading: 'lazy',
  };
  for (const [key, value] of Object.entries(attributes)) script.setAttribute(`data-${key}`, value);
  script.onerror = () => { status.textContent = '댓글을 불러오지 못했습니다. GitHub에서 직접 의견을 남길 수 있습니다.'; };
  document.querySelector('.giscus').append(script);
} else {
  status.textContent = 'GitHub Discussions에서 의견을 남길 수 있습니다. 아래 링크를 이용해주세요.';
}
