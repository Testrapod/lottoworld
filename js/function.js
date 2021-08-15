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