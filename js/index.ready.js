/* index.html document ready */
$(document).ready(function() {
    $("#make_lotto_btn").button().on("click", function(event) {
        var lottoNumList = lotto();
        var ballList = $(".ball");

        for(var i=0; i<6; i++) {
            var num = lottoNumList[i];
            $(ballList[i]).text(num);
            if(num <= 10) $(ballList[i]).css("background-color", "#FBC400");
            else if(11 <= num && num <= 20) $(ballList[i]).css("background-color", "#69C8F2");
            else if(21 <= num && num <= 30) $(ballList[i]).css("background-color", "#FF7272");
            else if(31 <= num && num <= 40) $(ballList[i]).css("background-color", "#AAAAAA");
            else if(41 <= num) $(ballList[i]).css("background-color", "#B0D840");
        }
    });
});