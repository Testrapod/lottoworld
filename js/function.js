/* algorithm function */
function lotto() {
    var lottoNumList = [];

    for(var i=0; i<6; i++) {
        var num = Math.floor(Math.random() * 45) + 1;
        if(!(lottoNumList.find((x) => (x === num)))) lottoNumList.push(num);
        else i--;
    }

    return lottoNumList;
}

function stateFlip(state) {
    if(state == 1) { // 1 -> 5
        $(".other-balls").css("display", "flex");
        $(".other-balls-text").css("display", "block");

        $(".circle").css("width", "40px");
        $(".circle").css("height", "40px");
        $(".circle").css("line-height", "40px");
        $(".circle").css("font-size", "large");
        $(".circle").css("margin", "5px");

        $("#navi").css("margin-bottom", "30px");
    } else { // 5 -> 1
        $(".other-balls").css("display", "none");
        $(".other-balls-text").css("display", "none");

        $(".circle").css("width", "100px");
        $(".circle").css("height", "100px");
        $(".circle").css("line-height", "100px");
        $(".circle").css("font-size", "x-large");
        $(".circle").css("margin", "20px");

        $("#navi").css("margin-bottom", "50px");
    }
}

function colorSetting(num, ball) {
    if(num <= 10) $(ball).css("background-color", "#FBC400");
    else if(11 <= num && num <= 20) $(ball).css("background-color", "#69C8F2");
    else if(21 <= num && num <= 30) $(ball).css("background-color", "#FF7272");
    else if(31 <= num && num <= 40) $(ball).css("background-color", "#AAAAAA");
    else if(41 <= num) $(ball).css("background-color", "#B0D840");
}