# Lotto World

[사이트 열기](https://testrapod.github.io/lottoworld/) · [공식 추첨결과](https://www.dhlottery.co.kr/lt645/result) · [GitHub Discussions](https://github.com/Testrapod/lottoworld/discussions)

로또 당첨번호 조회, 1~5세트 번호 생성·PNG 저장, 과거 회차 분석, 번호별 빈도, 판매점 지도와 GitHub 댓글을 제공하는 정적 사이트입니다. 프런트엔드와 데이터 수집 모두 JavaScript를 사용합니다. Java·jQuery·외부 차트/이미지 라이브러리는 필요하지 않습니다.

## 로컬 실행

Node.js 24 이상을 사용합니다. 개발·Actions에서 사용하는 버전은 `.node-version`에 고정되어 있습니다. 외부 npm 의존성이 없어 패키지 설치 없이 실행할 수 있습니다.

```sh
npm run dev
```

[로컬 미리보기](http://127.0.0.1:4173/lottoworld/)를 엽니다. 포트는 `PORT` 환경 변수로 변경할 수 있습니다. 서버는 `dist/`만 제공하며 `/lottoworld/` 하위 경로도 지원합니다. 소스를 수정한 후 서버를 다시 실행하거나 `npm run build`로 미리보기 파일을 재생성하세요. HTML을 `file://`로 직접 열면 모듈과 JSON 로딩이 동작하지 않습니다.

| 명령 | 기능 |
| --- | --- |
| `npm run update-data` | 공식 응답으로 누락 회차 보충, 검증 후 JSON 저장 |
| `npm run update-data -- --check` | 공식 최신 회차까지 수집·검증하되 파일에 저장하지 않음 |
| `npm run check-data` | 저장 파일 간 일관성·번호·회차·날짜 검증. 네트워크 불필요 |
| `npm test` | 데이터 처리·오류·번호 생성 회귀 테스트 |
| `npm run build` | 검증된 정적 배포 파일을 `dist/`에 생성 |

## 데이터 갱신

- `data/lotto_data_list.json`: 1회부터 공식 발표된 최신 회차까지의 기록. 기존 필드명 유지.
- `data/lotto_freq_list.json`: 기준 회차 `drwNoBy`와 번호 1~45의 출현 횟수 `counts`. 본번호만 집계하고 보너스는 제외합니다.
- `data/metadata.json`: 스키마 버전, 기준 회차·추첨일, 기록 수, 마지막 데이터 변경 시각(UTC), 공식 출처.

`updatedAt`은 데이터가 실제 변경된 때만 갱신됩니다. 화면은 이를 한국 시간으로 표시합니다. 재실행 시 변경이 없으면 커밋도 만들지 않습니다.

수집기는 현재 공식 결과 화면에서 사용하는 다음 JSON 경로를 이용합니다.

- 최신 회차: `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do`
- 회차별 묶음: `https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=회차`

이는 안정성을 보장하는 공개 API 계약이 있는 경로가 아닙니다. 응답 변환은 `scripts/lotto-source.mjs`에 모았습니다. 회차 순서를 가정하지 않고 누락·중복·저장 기록과의 충돌을 검사합니다. 최근 저장 회차를 겹쳐 조회해 공식 정정도 감지합니다. 타임아웃·재시도·요청 간격을 적용하며, HTML·접근 차단·불완전 응답은 실패로 처리합니다. 오류가 생기면 마지막 정상 데이터가 유지됩니다.

## GitHub Actions와 Pages

`.github/workflows/pages.yml`은 다음 경우에 검증·갱신·배포합니다.

- `main`에 코드가 push될 때
- Actions 화면에서 **Update lotto data and deploy Pages → Run workflow**를 실행할 때
- 한국 시간 토요일 21:17·22:17, 일요일 07:17. 워크플로의 cron은 UTC로 작성되어 있습니다.

예약 실행은 GitHub 사정에 따라 지연될 수 있습니다. 공개 저장소의 표준 `ubuntu-latest` runner를 사용하므로 개인 서버가 필요 없습니다. 고성능 유료 runner를 사용하지 않습니다. Pages 아티팩트는 하루만 보관합니다.

저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다. 갱신 작업은 데이터가 바뀌면 `github-actions[bot]`으로 `data/`만 커밋합니다. 이후 같은 실행이 해당 커밋을 checkout해 배포하므로, 봇 커밋이 새 push 이벤트를 발생시키지 않는 제약에 의존하지 않습니다.

일반 PR은 `check.yml`에서 네트워크 수집·Secrets 접근·배포 없이 검사합니다. 자동 데이터 저장에는 해당 작업의 `contents: write`가 필요하고, 배포에는 별도 `pages: write`와 `id-token: write` 권한을 사용합니다. 개인 액세스 토큰은 요구하지 않습니다. `main` 직접 쓰기를 제한하는 브랜치 보호를 추가한다면, 데이터 저장 방식도 PR 방식으로 변경해야 합니다.

### 실패 복구

1. Actions의 실패 실행에서 **Fetch and validate official results** 로그와 실행 요약을 확인합니다.
2. 동행복권 접근 제한·점검이면 기존 배포 데이터로 운영하며 나중에 **Run workflow**로 재시도합니다. GitHub runner의 접근 제한을 우회하지 않습니다.
3. 응답 형식 변경이면 `scripts/lotto-source.mjs`의 변환과 테스트를 수정합니다. 저장 기록 충돌은 공식 결과와 대조한 뒤 수동 검토합니다.
4. 저장소가 60일간 비활동 상태이면 GitHub가 예약 워크플로를 중지할 수 있습니다. Actions 화면에서 다시 활성화합니다. 정상적인 주간 데이터 커밋도 저장소 활동에 포함됩니다.
5. Actions 실행 실패 알림은 GitHub 개인 알림 설정에서 관리합니다. 화면도 오래된 데이터의 기준 회차와 갱신 지연을 표시합니다.

## 카카오 지도 설정

기본 설정에는 지도 키가 없습니다. 키가 없거나 지도/위치 조회에 실패해도 [공식 판매점 찾기](https://www.dhlottery.co.kr/prchsplcsrch/home)와 [카카오맵 검색](https://map.kakao.com/link/search/%EB%A1%9C%EB%98%90)을 사용할 수 있습니다.

로컬에서는 `.env.example`을 `.env`로 복사해 `KAKAO_MAP_JAVASCRIPT_KEY`를 설정합니다. 배포에서는 저장소 **Settings → Secrets and variables → Actions → Secrets**에 같은 이름으로 저장합니다. 빌드가 `dist/js/config.js`에 주입합니다. `.env`는 Git과 배포 대상에서 제외됩니다.

**JavaScript 지도 SDK 키는 배포 후 방문자의 브라우저에서 볼 수 있습니다.** Secrets 주입은 저장소 하드코딩을 없애는 방법이며, 방문자에게 키를 숨기는 방법은 아닙니다. 카카오 개발자 콘솔에서 다음을 확인하세요.

- 사용할 키가 **JavaScript 키**인지 확인
- JavaScript SDK 허용 도메인에 `https://testrapod.github.io` 등록
- 로컬 지도를 시험하려면 `http://127.0.0.1:4173` 등록. `localhost`를 쓴다면 별도 등록
- 카카오맵 API 활성화, 쿼터와 사용량 확인
- GitHub Pages의 도메인 제한은 `/lottoworld/` 경로 단위의 격리를 보장하지 않음

키를 전혀 공개하고 싶지 않으면 Secret을 비워 임베드 지도를 끄고 외부 검색 링크를 사용하세요. 기존 공개 키라는 이유만으로 Git 이력을 재작성하지 않습니다.

위치는 **지도 보기**를 누를 때만 요청하고 저장·로그 기록하지 않습니다. 위치 거부·시간 초과 시 서울시청 기준으로 표시하며 사용자가 지도를 이동해 재검색할 수 있습니다. 검색 반경은 `js/config.js`의 `mapRadius`(기본 1,000m)입니다. 실제 로또 판매 여부는 방문 전에 확인하세요.

## GitHub 댓글

[giscus](https://giscus.app/ko)가 공개 GitHub Discussions를 댓글 저장소로 사용합니다. 방문자는 GitHub로 로그인해 댓글·답글·반응을 남길 수 있습니다. 별도 서버·회원 DB·프런트엔드 GitHub 토큰이 필요 없습니다.

1. 저장소 **Settings → General → Features → Discussions**를 활성화합니다.
2. [giscus GitHub 앱](https://github.com/apps/giscus)을 **이 저장소 하나만 선택해** 설치합니다.
3. [giscus 설정 화면](https://giscus.app/ko)에서 저장소와 Announcements 카테고리를 선택합니다.
4. 공개 식별자 `repoId`, `category`, `categoryId`를 `js/config.js`에 설정합니다. 이 저장소에 맞는 실제 식별자를 기본값으로 제공합니다.
5. 다른 저장소로 옮긴다면 Actions Variables의 `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID` 또는 로컬 `.env`로 덮어쓸 수 있습니다.

Discussion 매핑은 URL 변경에 영향을 받지 않는 고정 문자열 **Lotto World 방명록**을 사용합니다. 첫 댓글 또는 반응 때 giscus가 글을 만듭니다. 위젯을 사용할 수 없어도 Discussions 직접 방문 링크가 표시됩니다. 예전 LiveRe 댓글은 자동 이전되지 않습니다.

## 기능과 운영 범위

- 일반 번호 생성은 데이터 조회 실패와 독립적으로 사용할 수 있습니다.
- 가중치 생성은 유효한 통계가 준비된 뒤 활성화합니다. 선택한 후보를 제거해 중복을 방지합니다.
- PNG 저장은 Canvas, 빈도 차트는 HTML/CSS로 구현해 외부 라이브러리 장애에 의존하지 않습니다.
- 날짜는 추첨일과 갱신 시각을 구분합니다. 달력으로 추정한 미래 번호를 당첨번호로 표시하지 않습니다.
- 구매 안내·소개·판매점 링크는 동행복권의 현재 공개 경로를 사용합니다. 구매 가능 시간·로그인·기기 조건은 공식 사이트가 판단합니다.
- `dist/`에는 HTML/CSS/JS/아이콘과 검증된 JSON만 포함합니다. 서버 스크립트·테스트·문서·로컬 설정은 배포하지 않습니다.

[조사와 초기 개선 계획](docs/IMPROVEMENT_PLAN.md)
