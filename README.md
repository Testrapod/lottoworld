# Lotto World

<h3 align="center"><a href="https://brienzb.github.io/lottoworld/">Lotto World</a></h3>


## 1. 홈
<img src="/readme/home.png" title="홈" alt="home"></img>
- 가장 최근에 당첨되었던 로또 번호가 메인으로 나온다. '로또 번호 생성' 버튼으로 새로운 로또 번호를 랜덤하게 얻을 수 있다.
- 로또에 대한 기본적인 정보와 이 회차의 1등 당첨 금액을 볼 수 있다.

<img src="/readme/kakao_map.png" title="카카오 맵" alt="kakao_map"></img>
- 홈페이지가 처음 로드될 때 위치 액세스 허용을 요구하는데 이를 동의하면, 내 주변의 로또 판매점에 대한 정보를 얻어올 수 있다. 
  * Kakao map API 이용하여, 반경 1km 이내의 로또 판매점을 검색한다.
  * 지도가 로드되지 않을 경우, '지도 가리기'를 누른 뒤 다시 한번 '지도 보기'를 누른다.
  * 지도를 움직이며 위치를 재설정한 뒤, '이 위치에서 재검색'을 통해 다시 검색이 가능하다.


## 2. 로또 번호 생성기
<img src="/readme/lotto_number_maker1.png" title="로또 번호 생성기 1" alt="lotto_number_maker1"></img>
- 생성할 로또 번호 갯수를 선택한 뒤, 그 갯수 만큼 로또 번호들을 생성한다. (1개부터 5개까지 가능)
- '이미지로 저장' 버튼을 누르면 생성한 로또 번호들을 이미지로 저장할 수 있다.

<img src="/readme/lotto_number_maker2.png" title="로또 번호 생성기 2" alt="lotto_number_maker2"></img>
- 통계 기반 로또 번호 추출은 지금까지 있었던 모든 로또 번호들의 빈도수를 확인하여, 그에 맞는 가중치로 번호를 추출한다.
  * '빈도수 높은 번호 우선'은 상대적으로 많이 나왔던 번호에 높은 가중치를 주어 번호를 추출한다.
  * '빈도수 낮은 번호 우선'은 상대적으로 적게 나왔던 번호에 높은 가중치를 주어 번호를 추출한다.
  * 가중치 랜덤 알고리즘은 누적 확률 분포를 이용하였다.


## 3. 로또 통계
<img src="/readme/lotto_statistic1.png" title="로또 통계 1" alt="lotto_statistic1"></img>
- 지난 회차의 로또 번호를 확인할 수 있다.
- 지난 회차동안 있었던 모든 로또들을 대상으로, 번호별 빈도수를 확인할 수 있다.

<img src="/readme/lotto_statistic2.png" title="로또 통계 2" alt="lotto_statistic2"></img>
- 번호 분석하기를 통해, 입력한 번호와 지금까지 있었던 로또 번호들을 비교하여 3개 이상 숫자가 같았던 회차들의 목록을 보여준다.


## 4. 기타
<img src="/readme/more_btn.png" title="더보기" alt="more_btn"></img>
- 더보기 버튼을 누르면, 로또를 구입 및 동행복권 홈페이지로 이동할 수 있는 버튼이 존재한다.

<img src="/readme/comment.png" title="댓글달기" alt="comment"></img>
- 댓글달기 버튼을 누르면, 댓글을 달 수 있는 페이지로 이동한다. 여기서 자유롭게 의견을 작성하거나 글을 게시할 수 있다.
  * 댓글기능은 Live Re API를 사용하였다.
