
import ex1 from './taskcode/ex1';
import ex2 from './taskcode/ex2';
import ex3 from './taskcode/ex3';
import ex4 from './taskcode/ex4';
import Stopwatch from './stopwatch';
export const ex = [ex1, ex2, ex3, ex4];

export const setEditorAndExperiment = (index, code, editor) => {
    const exText = `[実験開始]ボタンを押すと問題文とプログラムが表示されます。<br>
問題の答えがわかったら[答えを確認]ボタンを押してください。<br>
それぞれのボタンは一度だけしか押せません。<br>
(なのでまだ押さないように注意してください)<br>
それぞれのボタンは押すと時刻が表示されます。<br>
解答後は2つのの時刻と正解したかどうかを<br>
解答用紙の記入欄に記録してから次の問題に進んでください。<br>
用紙の余白や裏面は変数のメモ書きなど自由時使ってください。<br>
(この開始前説明文は全ての問題ページで共通です。)`;

    const exTexts = [ "",
                    "ポインタ渡し関数の問題です<br>以下のプログラムを実行したとき<br>最終的なa,b,c,d,eの値は？(回答例:a=1,b=2,c=3,d=4,e=5)<br>",
                    "階乗を計算する関数の問題です。<br>以下のプログラムを実行したとき<br>関数fが3度目にreturnするときのrと<br>そのときのn,(*pn)の表す値は？(回答例:n=1,r=2,(*pn)=3,)",
                    "メモリの動的確保の問題です<br>以下のプログラムを実行したときmain関数がreturnする時点で<br>ヒープ領域に未開放のメモリ領域があれば<br>そのメモリを参照する変数とそれらのメモリ上の値は何か？(回答例:ps[0]={1,2,3},ps[3]={0,3,2})",
                    "再帰関数の問題です<br>以下のプログラムを実行したとき<br>n=1, a='B', b='A', c='C'<br>になるのは関数Hが何回呼ばれたときか？(回答例:10回目)"
        ];

    if(index === 0) {
        localStorage.currentex = "";
    } else if(1 <= index && index <= 4) {
        localStorage.currentex = `ex${index}`;
        localStorage.startTime = "実験開始";
        localStorage.sourcefile = "";
        localStorage.debug="false";
    }

    if(index === 0) {
        document.getElementById("exstart").style.display = "none";
        document.getElementById("exans").style.display = "none";
        localStorage.startTime = "";
    } else if(1 <= index && index <= 4) {
        if(localStorage.startTime == "実験開始" ) {
            document.getElementById("description").innerHTML = exText;
        } else {
            document.getElementById("description").innerHTML = exTexts[index];
        }
    }
    $('#exans').prop('disabled', true);
    var exStartElem = document.getElementById("exstart");
    var stopwatch;

    $('#exstart').click(function (e) {
        stopwatch = new Stopwatch(exStartElem, exStartElem);
        stopwatch.start();
        $('#exstart').prop('disabled', true);
        $('#exans').prop('disabled', false);
        editor.setValue(code, -1);
        document.getElementById("description").innerHTML = exTexts[index];
        editor.setReadOnly(true);
    });
    $('#exans').click(function (e) {
        if(!stopwatch.isRunning()){
            return;
        }
        stopwatch.stop();

        if(localStorage.currentex == "ex1"){
            document.getElementById("description").innerHTML += "<hr><br>答え a=3,b=2,c=1,d=4,e=6<br>";
        }
        else if(localStorage.currentex == "ex2"){
            document.getElementById("description").innerHTML += "<hr><br>答え n=2,r=2,(*pn)=0<br>";
        }
        else if(localStorage.currentex == "ex3"){
            document.getElementById("description").innerHTML += "<hr><br>答え ps[1]={1,2,5}<br>";
        }
        else if(localStorage.currentex == "ex4"){
            document.getElementById("description").innerHTML += "<hr><br>答え 5回目<br>";
        }
        document.getElementById("description").innerHTML += "所要時間と正解・不正解を用紙にメモし、<br>一度トップページに戻り次の問題に進んでください。";
    });
}
