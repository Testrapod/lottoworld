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

function colorSetting(num, ball) {
    if(num <= 10) $(ball).css("background-color", "#FBC400");
    else if(11 <= num && num <= 20) $(ball).css("background-color", "#69C8F2");
    else if(21 <= num && num <= 30) $(ball).css("background-color", "#FF7272");
    else if(31 <= num && num <= 40) $(ball).css("background-color", "#AAAAAA");
    else if(41 <= num) $(ball).css("background-color", "#B0D840");
}