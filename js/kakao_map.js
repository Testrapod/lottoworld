$(document).ready(function () {
    var isShowMap = false;
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 }); // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
    var map;

    // 현재 위치 로드
    var lat, lon;
    navigator.geolocation.getCurrentPosition(function (pos) {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
    });

    $("#show_map_btn").button().on("click", function (event) {
        if (!isShowMap) {
            isShowMap = true;
            $("#show_map_btn").css("margin-top", "20px");
            $("#show_map_btn").css("margin-bottom", "20px");
            $("#show_map_btn").text("지도 가리기");
            $("#reset_map_btn").css("margin-top", "20px");
            $("#reset_map_btn").css("margin-bottom", "20px");
            $("#reset_map_btn").css("display", "inline-block");
            $("#show_map").css("display", "block");

            $('#map').empty();
            var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
                mapOption = {
                    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
                    level: 3 // 지도의 확대 레벨
                };

            // 지도를 생성합니다    
            map = new kakao.maps.Map(mapContainer, mapOption);

            // 장소 검색 객체를 생성합니다
            var ps = new kakao.maps.services.Places(map);

            // 키워드로 장소를 검색합니다
            ps.keywordSearch('로또', placesSearchCB, { x: lon, y: lat, radius: 10000 });

            // 키워드 검색 완료 시 호출되는 콜백함수 입니다
            function placesSearchCB(data, status, pagination) {
                if (status === kakao.maps.services.Status.OK) {

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
                    // LatLngBounds 객체에 좌표를 추가합니다
                    var bounds = new kakao.maps.LatLngBounds();
                    bounds.extend(new kakao.maps.LatLng(lat, lon));

                    for (var i = 0; i < data.length; i++) {
                        displayMarker(data[i]);
                        bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
                    }

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
                    map.setBounds(bounds);
                }
            }

            // 지도에 마커를 표시하는 함수입니다
            function displayMarker(place) {

                // 마커를 생성하고 지도에 표시합니다
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x)
                });

                // 마커에 클릭이벤트를 등록합니다
                kakao.maps.event.addListener(marker, 'click', function () {
                    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
                    infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
                    infowindow.open(map, marker);
                });
            }
        } else {
            isShowMap = false;
            $("#show_map_btn").css("margin", "0px");
            $("#show_map_btn").css("margin-bottom", "0px");
            $("#show_map_btn").text("지도 보기");
            $("#reset_map_btn").css("margin-top", "0px");
            $("#reset_map_btn").css("margin-bottom", "0px");
            $("#reset_map_btn").css("display", "none");
            $("#show_map").css("display", "none");
        }
    });

    $("#reset_map_btn").button().on("click", function (event) {
        getInfo(map, infowindow);
    });
});

function getInfo(map, infowindow) {
    // 지도의 현재 중심좌표를 얻어옵니다 
    var center = map.getCenter(); 

    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places(map);

    // 키워드로 장소를 검색합니다
    ps.keywordSearch('로또', placesSearchCB, { x: center.getLng(), y: center.getLat(), radius: 10000 });

    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            var bounds = new kakao.maps.LatLngBounds();
            bounds.extend(new kakao.maps.LatLng(center.getLat(), center.getLng()));

            for (var i = 0; i < data.length; i++) {
                displayMarker(data[i]);
                bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
            }

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
        }
    }

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place) {

        // 마커를 생성하고 지도에 표시합니다
        var marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x)
        });

        // 마커에 클릭이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'click', function () {
            // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
            infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
            infowindow.open(map, marker);
        });
    }
}