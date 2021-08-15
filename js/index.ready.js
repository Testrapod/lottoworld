/* index.html document ready */
$(document).ready(function () {
    $("#make_lotto_btn").button().on("click", function (event) {
        var lottoNumList = lotto();
        var ballList = $(".ball");

        for (var i = 0; i < 6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            colorSetting(num, ballList[i]);
        }
    });
});