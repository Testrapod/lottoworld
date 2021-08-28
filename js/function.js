/* algorithm function */
function lotto() {
    var lottoNumList = [];

    for(var i = 0; i < 6; i++) {
        var num = Math.floor(Math.random() * 45) + 1;
        if (!(lottoNumList.find((x) => (x === num)))) lottoNumList.push(num);
        else i--;
    }

    return lottoNumList.sort(function (a, b) { return a - b; });
}

function colorSetting(num, ball) {
    if(num <= 10) $(ball).css("background-color", "#FBC400");
    else if(11 <= num && num <= 20) $(ball).css("background-color", "#69C8F2");
    else if(21 <= num && num <= 30) $(ball).css("background-color", "#FF7272");
    else if(31 <= num && num <= 40) $(ball).css("background-color", "#AAAAAA");
    else if(41 <= num) $(ball).css("background-color", "#B0D840");
}

function saveImg(uri, filename) {
    var link = document.createElement('a');
    if(typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}

function inputNumberCheck(cmd, tag) {
    if(tag.value.length >= 2) return false;
    if(cmd > 47 && cmd < 58) return true;
    else return false;
}

function spanRed(text) {
    return "<span style=\"color:red\">" + text + "</span>"
}

function testIsRealRandom() {
    var freqList = [0,
                    0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0];
    
    for(var i = 0; i < 1000000; i++) {
        var tmpLottoList = lotto();
        for(var j = 0; j < 6; j++) {
            freqList[tmpLottoList[j]]++;
        }
    }

    console.log(freqList);
}