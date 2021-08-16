/* make_lotto.html document ready */
$(document).ready(function () {
    var captureable = false;

    $("#make_lotto_btn").button().on("click", function (event) {
        var count = $("#select_lotto_count option:selected").val();
        if (count == 0) {
            captureable = false;
            return;
        }

        var idx = 0;
        var viewBallsList = $(".view-balls");
        for (; idx < count; idx++) { $(viewBallsList[idx]).css("display", "flex"); }
        for (; idx < 5; idx++) { $(viewBallsList[idx]).css("display", "none"); }

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

        captureable = true;
    });

    $("#make_img_btn").button().on("click", function (event) {
        if (captureable == false) { return; }

        html2canvas(document.querySelector("#number_ball")).then(canvas => {
            saveImg(canvas.toDataURL('image/png'), "lotto.png");
        });
    });
});