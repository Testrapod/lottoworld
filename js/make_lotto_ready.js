/* make_lotto.html document ready */
$(document).ready(function () {
    var captureable = false;
    var lottoFreqList = []; var totalSum = 0;

    $.getJSON("https://brienzb.github.io/lottoworld/src/lotto_freq_list.json", function (data) {
        $.each(data, function (i, item) {
            if(i == 0) return true;

            lottoFreqList.push(item.number);
            totalSum += parseInt(item.number);
        });
    });

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

    $("#weighted_random_high_freq_btn").button().on("click", function (event) {
        var lottoNumList = highFreqLotto(lottoFreqList, totalSum);
        var ballList = $(".freq-ball");

        for (var i = 0; i < 6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            colorSetting(num, ballList[i]);
        }

        $(".view-freq-balls").css("display", "flex");
        $("#weighted_random_high_freq_btn").css("margin-top", "20px");
        $("#weighted_random_low_freq_btn").css("margin-top", "20px");
    });

    $("#weighted_random_low_freq_btn").button().on("click", function (event) {
        var lottoNumList = lowFreqLotto(lottoFreqList, totalSum);
        var ballList = $(".freq-ball");

        for (var i = 0; i < 6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            colorSetting(num, ballList[i]);
        }

        $(".view-freq-balls").css("display", "flex");
        $("#weighted_random_high_freq_btn").css("margin-top", "20px");
        $("#weighted_random_low_freq_btn").css("margin-top", "20px");
    });
});