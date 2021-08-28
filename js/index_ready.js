/* index.html document ready */
$(document).ready(function () {
    $.getJSON("https://10eastsea.github.io/lottoworld/src/lotto_data_list.json", function (data) {
        var lastestLottoData = data[data.length-1];
        $("#latest_winning_money span").text(parseInt(lastestLottoData.firstAccumamnt).toLocaleString() + "원");
        $("#latest_winning_money small").text("(1인당 당첨액: " + parseInt(lastestLottoData.firstWinamnt).toLocaleString() + "원)");
        $("#latest_winning_date").text(lastestLottoData.drwNoDate + " 수령 금액 기준");

        var lottoNumList = [lastestLottoData.drwtNo1, lastestLottoData.drwtNo2, lastestLottoData.drwtNo3, lastestLottoData.drwtNo4, lastestLottoData.drwtNo5, lastestLottoData.drwtNo6];
        var ballList = $(".ball");

        for (var i = 0; i < 6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            colorSetting(num, ballList[i]);
        }
    });

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