import { createConsoleEditor, createEditor } from './editor';
import { file_upload } from './file';
import showLanguage from './language';
import {ex, setEditorAndExperiment} from './experiment';
import {restartLogging, flushLogToSave ,addLog} from './log';

window.GlobalStorage = { isStdin: false, line: 0, debug: false, lang: 'jp', log: [] };

// エディタを初期化
const defaultSourceCode = String.raw`#include<stdio.h>
int recursiveToThree(int n){
    printf("%d th\n", n + 1);
    if(n < 3){
        int r = recursiveToThree(n + 1);
        n = r;
    }
    return n;
}
int main(){
    int n = 0;//variable declaration

    n = recursiveToThree(0);//recursive function

    int arr[5] = {1, 2, 3};//array variable

    int* ptr = &arr[2];//pointer variable
    *ptr = 5;

    //dynamic memory allocation
    int* d_arry = malloc(sizeof(int) * 3);

    //two-dimensional dynamic array
    int* pd_arr[2];
    pd_arr[0] = malloc(sizeof(int) * 2);
    pd_arr[1] = malloc(sizeof(int) * 2);

    printf("Hello,world!\n");//standard output

    //memory leak
    free(pd_arr[0]);
    return 0;
}`;

const index = Number(localStorage.index);
localStorage.removeItem('index');
restartLogging();
if(index === 0){
  addLog('DEMO');
  const editor = createEditor('editorMain', true, defaultSourceCode );
  createConsoleEditor('output', '', editor);
  setEditorAndExperiment(index,defaultSourceCode,editor);
} else {
  addLog(`EX${index}`);
  const editor = createEditor('editorMain', true, '');
  createConsoleEditor('output', '', editor);
  setEditorAndExperiment(index, ex[index-1], editor);
}

$('#gototop').on('click', function() {
  flushLogToSave();
});

// ファイルアップロード時の処理
document.getElementById('files').addEventListener('change', file_upload, false);

// 説明表示ボタン
$(document)
  .on('click', '.popup_btn', function() {
    // ポップアップの幅と高さからmarginを計算する
    const mT = ($('#popup1').outerHeight() / 2) * -1 + 'px';
    const mL = ($('#popup1').outerWidth() / 2) * -1 + 'px';

    // marginを設定して表示
    $('.popup').hide();
    $('#popup1')
      .css({
        'margin-top': mT,
        'margin-left': mL,
      })
      .show();
    $('#overlay').show();
    return false;
  })
  .on('click', '.close_btn, #overlay', function() {
    $('.popup, #overlay').hide();
    return false;
  });

// キャンバスの設定
window.addEventListener(
  'load',
  () => {
    const container = document.getElementById('canvasContainer');
    const mainCanvas = document.getElementById('display');
    // const editorMain = document.getElementById("editorMain");
    let queue = null;
    let wait = 300;

    // Canvasサイズをコンテナの100%に
    const setCanvasSize = () => {
      mainCanvas.width = 0.97 * container.offsetWidth;
      mainCanvas.height = 0.95 * window.innerHeight;

      // const height = $(window).height() - 180;
      // $("#editorMain").css("height", 0.8 * Math.max(height, 500) + "px");
      // $("#output").css("height", 0.22 * Math.max(height, 500) + "px");
      // editor.resize()
    };

    // ページ読込時にCanvasサイズ設定
    setCanvasSize();

    // リサイズ時にCanvasサイズを再設定
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(queue);
        queue = setTimeout(() => {
          setCanvasSize();
        }, wait);
      },
      false,
    );
  },
  false,
);

// 日本語と英語の切り替え
$('#language-swicher').toggles({
  text: { on: '日本語', off: 'English' },
  on: true
});
$('#language-swicher').on('toggle', (e, active) => {
  if (active) {
    showLanguage('jp'); // 日本語を表示 詳細後述
  } else {
    showLanguage('en'); // 英語を表示
  }
});

showLanguage('jp'); // デフォルトの言語
