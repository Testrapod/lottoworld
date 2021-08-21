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
    **              -data: 파일을 새로 만들어 모든 정보를 서버에서 크롤링 (파일이 이미 존재한다면 덮어 씀)
    **              -data-update: 이미 존재하는 파일에 새로 업데이트된 내용만 서버에서 크롤링
    **              -freq: 파일을 새로 만들어 모든 정보를 서버에서 크롤링 후 번호별 빈도수 체크 (파일이 이미 존재한다면 덮어 씀)
    **              -freq-update: 이미 존재하는 파일에 새로 업데이트된 내용만 서버에서 크롤링
    **
    **              -all: -data와 -freq를 순차적으로 실행
    **              -update: -data-update와 -freq-update를 순차적으로 실행
    **
    */

    public static final String BASE_URL = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
    public static final String LOTTO_DATA_LIST_PATH = "./lotto_data_list.json";
    public static final String LOTTO_FREQ_LIST_PATH = "./lotto_freq_list.json";

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

    public static void makeJsonFileForLottoData(ArrayList<JSONObject> lottoDataList) throws Exception {
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

    public static void makeJsonFileForLottoFreq(int drwNo, int[] lottoFreqList) throws Exception {
        File file = new File(LOTTO_FREQ_LIST_PATH);
        file.createNewFile();

        BufferedWriter fw = new BufferedWriter(new FileWriter(file, false));
        fw.write("[\n    {\"drwNoBy\":\"" + drwNo + "\"},\n");
        for(int i=1; i<45; i++) { fw.write("    {\"number\":\"" + lottoFreqList[i] + "\"},\n"); }
        fw.write("    {\"number\":\"" + lottoFreqList[45] + "\"}\n]");

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

        makeJsonFileForLottoData(lottoDataList);
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

    public static void allLottoFreqCrawling(String baseUrl) throws Exception {
        int[] lottoFreqList = new int[46];

        int drwNo = 1;
        for( ; ; drwNo++) {
            String url = baseUrl + drwNo;
            JSONObject lottoData = urlRead(url);

            if(lottoData.get("returnValue").equals("fail")) {
                drwNo--;
                break;
            } else {
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo1").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo2").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo3").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo4").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo5").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo6").toString())]++;
            }
        }

        makeJsonFileForLottoFreq(drwNo, lottoFreqList);
    }

    public static void updateLottoFreqCrawling(String baseUrl) throws Exception {
        int[] lottoFreqList = new int[46];
        JSONParser parser = new JSONParser();

        FileReader fr = new FileReader(LOTTO_FREQ_LIST_PATH);
        Object obj = parser.parse(fr);
        JSONArray lottoFreqJsonList = (JSONArray) obj;
        fr.close();

        JSONObject drwNoByObj = (JSONObject) lottoFreqJsonList.get(0);
        int drwNo = Integer.parseInt(drwNoByObj.get("drwNoBy").toString()) + 1;

        for(int i=1; i<=45; i++) {
            JSONObject tmpObj = (JSONObject) lottoFreqJsonList.get(i);
            lottoFreqList[i] = Integer.parseInt(tmpObj.get("number").toString());
        }

        for( ; ; drwNo++) {
            String url = baseUrl + drwNo;
            JSONObject lottoData = urlRead(url);

            if(lottoData.get("returnValue").equals("fail")) {
                drwNo--;
                break;
            } else {
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo1").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo2").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo3").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo4").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo5").toString())]++;
                lottoFreqList[Integer.parseInt(lottoData.get("drwtNo6").toString())]++;
            }
        }
        
        makeJsonFileForLottoFreq(drwNo, lottoFreqList);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    public static void main(String[] args) throws Exception {
        if(args.length < 1) {
            System.out.println();
            System.out.println("Please enter the [FLAG]");
            System.out.println();
            System.out.println("    -data:        Make a new file to crawl all information from server (overwrite if file already exists)");
            System.out.println("    -data-update: Only newly updated content is crawled from the server to files that already exist");
            System.out.println("    -freq:        Make a new file to crawl all information from server and check the frequency by number");
            System.out.println("    -freq-update: Only newly updated content is crawled from the server to files that already exist");
            System.out.println();
            System.out.println("    -all:         Execute the \"-data\" [FLAG] and \"-freq\" [FLAG] sequentially");
            System.out.println("    -update:      Execute the \"-data-update\" [FLAG] and \"-freq-update\" [FLAG] sequentially");
            System.out.println();
            return;
        }

        if(args[0].equals("-data")) allLottoDataCrawling(BASE_URL);
        else if(args[0].equals("-data-update")) updateLottoDataCrawling(BASE_URL);
        else if(args[0].equals("-freq")) allLottoFreqCrawling(BASE_URL);
        else if(args[0].equals("-freq-update")) updateLottoFreqCrawling(BASE_URL);
        else if(args[0].equals("-all")) {
            allLottoDataCrawling(BASE_URL);
            allLottoFreqCrawling(BASE_URL);
        }
        else if(args[0].equals("-update")) {
            updateLottoDataCrawling(BASE_URL);
            updateLottoFreqCrawling(BASE_URL);
        }
        else System.out.println("This [FLAG] does not exist");
    }
}