import { config } from './config.js';
import { message } from './site.js';
const toggle = document.getElementById('show_map_btn');
const reset = document.getElementById('reset_map_btn');
const panel = document.getElementById('show_map');
let sdk, map, infoWindow;
let markers = [];
function loadSdk() {
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao);
  sdk ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => { script.remove(); reject(new Error('지도를 불러오는 시간이 초과되었습니다. 아래 판매점 검색 링크를 이용해주세요.')); }, 15000);
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('지도를 불러오지 못했습니다. 아래 판매점 검색 링크를 이용해주세요.')); };
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(config.kakaoMapJavaScriptKey)}&libraries=services&autoload=false`;
    script.onerror = fail;
    script.onload = () => {
      if (!window.kakao?.maps?.load) return fail();
      window.kakao.maps.load(() => {
        clearTimeout(timer);
        if (!window.kakao.maps.services) return fail();
        resolve(window.kakao);
      });
    };
    document.head.append(script);
  }).catch(error => { sdk = undefined; throw error; });
  return sdk;
}
function locate() {
  return new Promise(resolve => {
    const fallback = reason => resolve({ lat: 37.566826, lng: 126.9786567, note: `${reason} 서울시청 기준으로 표시합니다. 지도를 이동한 뒤 재검색할 수 있습니다.` });
    if (!navigator.geolocation) return fallback('현재 위치를 사용할 수 없습니다.');
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude: lat, longitude: lng } = position.coords;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return fallback('위치 정보를 확인하지 못했습니다.');
      resolve({ lat, lng, note: '현재 위치를 기준으로 표시합니다.' });
    }, () => fallback('위치 권한이 없거나 위치를 확인하지 못했습니다.'), { timeout: 7000, maximumAge: 60000 });
  });
}
function search(note = '지도 중심을 기준으로 표시합니다.') {
  reset.disabled = true;
  const kakao = window.kakao;
  const center = map.getCenter();
  for (const marker of markers) marker.setMap(null);
  markers = []; infoWindow.close();
  message('map-status', '주변 판매점을 검색하고 있습니다.');
  const timeout = setTimeout(() => { reset.disabled = false; message('map-status', '검색 응답이 지연되고 있습니다. 재검색하거나 아래 링크를 이용해주세요.', true); }, 15000);
  const places = new kakao.maps.services.Places();
  places.keywordSearch('로또', (data, status) => {
    clearTimeout(timeout); reset.disabled = false;
    if (status === kakao.maps.services.Status.ZERO_RESULT) return message('map-status', `${note} 반경 ${config.mapRadius / 1000}km 안에 검색된 판매점이 없습니다.`);
    if (status !== kakao.maps.services.Status.OK) return message('map-status', '판매점을 검색하지 못했습니다. 아래 공식 판매점 찾기를 이용해주세요.', true);
    for (const place of data) {
      const lat = Number(place.y), lng = Number(place.x);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const marker = new kakao.maps.Marker({ map, position: new kakao.maps.LatLng(lat, lng) }); markers.push(marker);
      kakao.maps.event.addListener(marker, 'click', () => {
        const content = document.createElement('div'); content.className = 'map-place'; content.textContent = place.place_name;
        infoWindow.setContent(content); infoWindow.open(map, marker);
      });
    }
    message('map-status', `${note} 반경 ${config.mapRadius / 1000}km 내 검색 결과 ${markers.length}곳입니다. 판매 여부는 방문 전 확인해주세요.`);
  }, { x: center.getLng(), y: center.getLat(), radius: config.mapRadius });
}
if (toggle) {
  toggle.addEventListener('click', async () => {
    if (!config.kakaoMapJavaScriptKey) {
      message('map-status', '지도를 사용할 수 없습니다. 아래 공식 판매점 찾기 또는 카카오맵 검색을 이용해주세요.'); return;
    }
    if (map && !panel.hidden) { panel.hidden = true; reset.hidden = true; toggle.textContent = '지도 보기'; return; }
    if (map) { panel.hidden = false; reset.hidden = false; map.relayout(); toggle.textContent = '지도 가리기'; return; }
    toggle.disabled = true; message('map-status', '지도와 현재 위치를 준비하고 있습니다.');
    try {
      const kakao = await loadSdk(); const position = await locate(); panel.hidden = false;
      map = new kakao.maps.Map(document.getElementById('map'), { center: new kakao.maps.LatLng(position.lat, position.lng), level: 4 });
      infoWindow = new kakao.maps.InfoWindow({ zIndex: 1 });
      toggle.textContent = '지도 가리기'; reset.hidden = false; search(position.note);
    } catch (error) { panel.hidden = true; message('map-status', error.message, true); }
    finally { toggle.disabled = false; }
  });
  reset.addEventListener('click', () => { if (map) search(); });
}
