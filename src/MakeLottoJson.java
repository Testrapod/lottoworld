import java.util.*;
import java.io.*;
import java.net.*;
import org.json.simple.*;
import org.json.simple.parser.*;

public class MakeLottoJson {

    /*
    **  How to use:
    **      java -cp .:json-simple-1.1.1.jar MakeLottoJson [FALG]
    **
    **          [FLAG]
    **              -all: 파일을 새로 만들어 모든 정보를 서버에서 크롤링 (파일이 이미 존재한다면 덮어 씀)
    **              -update: 이미 존재하는 파일에 새로 업데이트된 내용만 서버에서 크롤링
    **
    */

    public static final String BASE_URL = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
    public static final String LOTTO_DATA_LIST_PATH = "./lotto_data_list.json";

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

    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
        
        File file = new File(LOTTO_DATA_LIST_PATH);
        file.createNewFile();

		BufferedWriter fw = new BufferedWriter(new FileWriter(file, false));
        fw.write("[\n");
        for(int i=0; i<length-1; i++) { fw.write("    " + lottoDataList.get(i) + ",\n"); }
        fw.write("    " + lottoDataList.get(length-1) + "\n]");

        fw.flush();
        fw.close();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    public static void allLottoDataCrawling(String baseUrl) throws Exception {
        ArrayList<JSONObject> lottoDataList = new ArrayList<JSONObject>();

        for(int drwNo = 1; ; drwNo++) {
            String url = baseUrl + drwNo;
            JSONObject lottoData = urlRead(url);

            if(lottoData.get("returnValue").equals("fail")) break;
            else lottoDataList.add(lottoData);
        }

        makeJsonFile(lottoDataList);
    }

    public static void updateLottoDataCrawling(String baseUrl) throws Exception {
        RandomAccessFile raf = new RandomAccessFile(LOTTO_DATA_LIST_PATH, "rw");

        byte[] data = new byte[64];
        raf.seek(raf.length()-64);
        raf.read(data);

        String tmp = new String(data);
        int start = tmp.indexOf("\"drwNo\":") + 8;
        int end = tmp.indexOf(",\"drwtNo2\":");
        int drwNo = Integer.parseInt(tmp.substring(start, end)) + 1;

        raf.seek(raf.length()-2);
        String prefix = ",\n"; raf.write(prefix.getBytes());
        for( ; ; drwNo++) {
            String url = baseUrl + drwNo;
            JSONObject lottoData = urlRead(url);

            if(lottoData.get("returnValue").equals("fail")) break;
            else {
                String line = "    " + lottoData + ",\n";
                raf.write(line.getBytes());
            }
        }
        raf.seek(raf.length()-2);
        String postfix = "\n]"; raf.write(postfix.getBytes());

        raf.close();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    public static void main(String[] args) throws Exception {
        if(args.length < 1) {
            System.out.println("Please enter the [FLAG]");
            System.out.println("    -all: 파일을 새로 만들어 모든 정보를 서버에서 크롤링 (파일이 이미 존재한다면 덮어 씀)");
            System.out.println("    -update: 이미 존재하는 파일에 새로 업데이트된 내용만 서버에서 크롤링");
            return;
        }

        if(args[0].equals("-all")) allLottoDataCrawling(BASE_URL);
        else if(args[0].equals("-update")) updateLottoDataCrawling(BASE_URL);
        System.out.println("Success");
    }
}