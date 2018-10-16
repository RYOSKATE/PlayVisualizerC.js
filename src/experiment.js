
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
[実験開始]ボタンは押すと経過時間が表示されます。<br>
[答えを確認]後は経過時間と正解したかどうかを<br>
解答用紙の記入欄に記録してから次の問題に進んでください。<br>
用紙の余白や裏面は変数のメモ書きなど自由時使ってください。<br>
(この開始前説明文は全ての問題ページで共通です。)`;

    const exTexts = [ "",
"ポインタ渡し関数の問題です<br>以下のプログラムを実行したとき<br>最終的なa,b,c,d,eの値は？(回答例:a=1,b=2,c=3,d=4,e=5)",
"階乗を計算する関数の問題です。<br>以下のプログラムを実行したとき<br>関数fが3度目にreturnするときのrと<br>そのときのn,(*pn)の表す値は？(回答例:n=1,r=2,(*pn)=3)",
"メモリの動的確保の問題です<br>以下のプログラムを実行したときmain関数がreturnする時点で<br>ヒープ領域に未開放のメモリ領域があれば<br>そのメモリを参照する変数とそれらのメモリ上の値は何か？(回答例:ps[0]={1,2,3},ps[3]={0,3,2})",
"再帰関数の問題です<br>以下のプログラムを実行したとき<br>n=1, a='B', b='A', c='C'<br>になるのは関数Hが何回呼ばれたときか？(回答例:10回目)"
    ];

    if(index === 0) {
        $('#exstart').css('display', 'none');
        $('#exans').css('display', 'none');
        return;
    } 

    $("#description").html(exText);

    $('#exans').prop('disabled', true);
    
    const exStartElem = document.getElementById("exstart");    
    const stopwatch = new Stopwatch(exStartElem, exStartElem);

    $('#exstart').click(function (e) { 
        stopwatch.start();
        $('#exstart').prop('disabled', true);
        $('#exans').prop('disabled', false);
        $("#description").html(exTexts[index]);
        editor.setValue(code, -1);
        editor.setReadOnly(true);
    });
    $('#exans').click(function (e) {
        if(!stopwatch.isRunning()){
            return;
        }
        stopwatch.stop();
        const answers = [ "",
            "a=3,b=2,c=1,d=4,e=6",
            "n=2,r=2,(*pn)=0",
            "ps[1]={1,2,5}",
            "5回目",
        ];
        $("#description").append(`<br><br>答え ${answers[index]}<br><br>`);
        $("#description").append("所要時間と正解・不正解を用紙にメモし、<br>一度トップページに戻り次の問題に進んでください。");
    });
}
