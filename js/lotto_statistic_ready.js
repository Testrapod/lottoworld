/* lotto_statistic.html document ready */
$(document).ready(function () {
    $.getJSON("src/lotto_data_list", function (data) {
        $each(data, function (I, item) {
            console.log(item.drwNo);
        });
    });
});