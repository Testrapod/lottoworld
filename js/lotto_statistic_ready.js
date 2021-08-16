/* lotto_statistic.html document ready */
function ballListChangeWithJson(lottoData) {
    var ballList = $(".ball");

    $(ballList[0]).text(lottoData.drwtNo1);
    colorSetting(lottoData.drwtNo1, ballList[0]);
    $(ballList[1]).text(lottoData.drwtNo2);
    colorSetting(lottoData.drwtNo2, ballList[1]);
    $(ballList[2]).text(lottoData.drwtNo3);
    colorSetting(lottoData.drwtNo3, ballList[2]);
    $(ballList[3]).text(lottoData.drwtNo4);
    colorSetting(lottoData.drwtNo4, ballList[3]);
    $(ballList[4]).text(lottoData.drwtNo5);
    colorSetting(lottoData.drwtNo5, ballList[4]);
    $(ballList[5]).text(lottoData.drwtNo6);
    colorSetting(lottoData.drwtNo6, ballList[5]);
}

$(document).ready(function () {
    var lottoDataList;

    $.getJSON("https://10eastsea.github.io/lottoworld/src/lotto_data_list.json", function (data) {
        lottoDataList = data;
        lottoDataList = lottoDataList.sort(function(a,b) { return b.drwNo - a.drwNo; });

        $.each(lottoDataList, function (i, item) {
            var option = $("<option value="+i+">"+lottoDataList[i].drwNo+"</option>");
            $("#select_lotto_number").append(option);
            // console.log(item.drwNo);
        });

        var number = $("#select_lotto_number option:selected").val();
        var lottoData = lottoDataList[number];
        ballListChangeWithJson(lottoData);
    });

    $("#search_lotto_btn").button().on("click", function (event) {
        var number = $("#select_lotto_number option:selected").val();
        var lottoData = lottoDataList[number];
        ballListChangeWithJson(lottoData);
    });
});