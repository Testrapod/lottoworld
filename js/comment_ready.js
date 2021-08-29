/* comment.html document ready */
$(document).ready(function () {
    $.getJSON("https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1", function (data) {
        console.log(data);
    });
});