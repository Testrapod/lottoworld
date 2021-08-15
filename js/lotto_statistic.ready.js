/* lotto_statistic.html document ready */
function performGet() {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin','https://www.dhlottery.co.kr/common.do');
    headers.append('Access-Control-Allow-Origin', 'https://www.dhlottery.co.kr/common.do')

    fetch("https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=976", {
        mode: 'cors',
        method: 'GET',
        headers: headers
    })
    .then(response => response.json())
    .then(json => console.log(json));
}

$(document).ready(function () {
    performGet();

    // fetch("https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=976")
    //     .then((response) => response.json())
    //     .then((data) => console.log(data));
});