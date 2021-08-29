/* a tag link router */
$(document).ready(function () {
    var filter = "win16|win32|win64|mac|macintel";
    if(navigator.platform) {
        if(filter.indexOf(navigator.platform.toLowerCase()) < 0) {
            //mobile
            $("#lotto_buy_link").attr("href", "#");
            $("#lotto_buy_link").click(function() {
                alert("PC 혹은 판매점에서 구매 가능합니다.")
            });
            $("#lotto_home_link").attr("href", "https://m.dhlottery.co.kr/common.do?method=main");
            $("#lotto_info_link").attr("href", "https://m.dhlottery.co.kr/gameInfo.do?method=gameMethod");
        }
    }
});