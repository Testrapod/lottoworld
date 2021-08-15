/* make_lotto.html document ready */
$(document).ready(function () {
    $("#make_lotto_btn").button().on("click", function (event) {
        var count = $("#select_lotto_count option:selected").val();

        var idx = 0;
        var viewBallsList = $(".view-balls");
        for( ; idx<count; idx++) { $(viewBallsList[idx]).css("display", "flex"); }
        for( ; idx<5; idx++) { $(viewBallsList[idx]).css("display", "none"); }

        var ballList = $(".ball");
        idx = 0;

        for (var j = 0; j < count; j++) {
            var lottoNumList = lotto();

            for (var i = 0; i < 6; i++) {
                var num = lottoNumList[i];
                $(ballList[idx]).text(num);
                colorSetting(num, ballList[idx]);
                idx++;
            }
        }
    });
});