import java.util.*;
import java.io.*;
import java.net.*;
import org.json.simple.*;
import org.json.simple.parser.*;

public class MakeLottoJson {

    /*
    **  How to Run:
    **      java -cp .:json-simple-1.1.1.jar MakeLottoJson
    */

    // returnValue:     "success" or "fail"
    // drwNo:           [회차번호]
    // totSellamnt:     [누적상금]
    // drwNoDate:       [날짜]
    // firstAccumamnt:  [총 1등 당첨금]
    // firstPrzwnerCo:  [1등 인원수]
    // firstWinamnt:    [1등 수령액]
    // drwtNo1:         [1번 번호]
    // drwtNo2:         [2번 번호
    // drwtNo3:         [3번 번호]
    // drwtNo4:         [4번 번호]
    // drwtNo5:         [5번 번호]
    // drwtNo6:         [6번 번호]
    // bnusNo:          [보너스 번호]

    public static JSONObject strToJson(String str) throws Exception {
        JSONParser parser = new JSONParser();
        Object obj = parser.parse(str);
        return (JSONObject) obj;
    }

    public static JSONObject urlRead(String _url) throws Exception {
        URL url = new URL(_url);
        BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream(), "UTF8"));
    
        String content = "", line = "";
        while((line = br.readLine()) != null) content += line;
        br.close();

        return strToJson(content);
    }

    public static void makeJsonFile(ArrayList<JSONObject> lottoDataList) throws Exception {
        int length = lottoDataList.size();
        
        File file = new File("./lotto.json");
        file.createNewFile();

		BufferedWriter fw = new BufferedWriter(new FileWriter(file, false));
        fw.write("[\n");
        for(int i=0; i<length-1; i++) { fw.write("    " + lottoDataList.get(i) + ",\n"); }
        fw.write("    " + lottoDataList.get(length-1) + "\n]");

        fw.flush();
        fw.close();
    }

    public static void allLottoDataCrawling(String baseUrl) throws Exception {
        ArrayList<JSONObject> lottoDataList = new ArrayList<JSONObject>();

        for(int idx = 1; ; idx++) {
            String url = baseUrl + idx;
            JSONObject lottoData = urlRead(url);

            if(lottoData.get("returnValue").equals("fail")) break;
            else lottoDataList.add(lottoData);
        }

        makeJsonFile(lottoDataList);
    }

    public static void main(String[] args) throws Exception {
        String baseUrl = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
        allLottoDataCrawling(baseUrl);
    }
}