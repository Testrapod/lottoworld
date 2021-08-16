/* lotto_statistic.html document ready */
var numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                  31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                  41, 42, 43, 44, 45];
var colorList1To10 = ["#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400", "#FBC400"];
var colorList11To20 = ["#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2", "#69C8F2"];
var colorList21To30 = ["#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272", "#FF7272"];
var colorList31To40 = ["#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA", "#AAAAAA"];
var colorList41To45 = ["#B0D840", "#B0D840", "#B0D840", "#B0D840", "#B0D840"];
var colorList = colorList1To10.concat(colorList11To20, colorList21To30, colorList31To40, colorList41To45);

var lottoFreqMax = 180, lottoFreqMin = 60;
var lottoFreqList = [];

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
        lottoDataList = lottoDataList.sort(function (a, b) { return b.drwNo - a.drwNo; });

        $.each(lottoDataList, function (i, item) {
            var option = $("<option value=" + i + ">" + lottoDataList[i].drwNo + "</option>");
            $("#select_lotto_number").append(option);
        });

        // select에 번호 추가
        var number = $("#select_lotto_number option:selected").val();
        var lottoData = lottoDataList[number];
        ballListChangeWithJson(lottoData);

        // 날짜 세팅
        $("#select_lotto_date").text(lottoData.drwNoDate);
    });

    $.getJSON("https://10eastsea.github.io/lottoworld/src/lotto_freq_list.json", function (data) {
        $.each(data, function (i, item) { lottoFreqList.push(item.number); });

        // 번호별 빈도수 차트 그리기
        var ctx = document.getElementById('number_frequency_chart');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: numberList,
                datasets: [{
                    data: lottoFreqList,
                    backgroundColor: colorList,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        max: lottoFreqMax,
                        min: lottoFreqMin,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            }
        });
    });

    $("#search_lotto_btn").button().on("click", function (event) {
        // select에 번호 추가
        var number = $("#select_lotto_number option:selected").val();
        var lottoData = lottoDataList[number];
        ballListChangeWithJson(lottoData);

        // 날짜 세팅
        $("#select_lotto_date").text(lottoData.drwNoDate);
    });
});