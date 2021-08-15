/* index.html document ready */
$(document).ready(function () {
    var state = 1; // 화면에 보여질 로또번호 세트 (번호 6개가 한 세트)

    $("#make_lotto_btn").button().on("click", function (event) {
        if(state != 1) {
            stateFlip(state);
            state = 1;
        }

        var lottoNumList = lotto();
        var ballList = $(".ball");

        for (var i = 0; i < 6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            colorSetting(num, ballList[i]);
        }
    });

    $("#make_5_lotto_btn").button().on("click", function (event) {
        if(state != 5) {
            stateFlip(state);
            state = 5;
        }

        var idx = 0;
        var ballList = $(".ball");
        for (var j = 0; j < 5; j++) {
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