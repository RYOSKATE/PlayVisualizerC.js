import { createConsoleEditor, createEditor } from './editor';
import { file_upload } from './file';
import showLanguage from './language';

window.GlobalStorage = { isStdin: false, line: 0, debug: false, lang: 'jp' };

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
    int n = 0;//example of variable declaration

    n = recursiveToThree(0);//example of recursive function

    int arr[5] = {1, 2, 3};//example of array variable

    int* ptr = &arr[2];//example of pointer variable
    *ptr = 5;

    //example of dynamic memory allocation
    int* d_arry = malloc(sizeof(int) * 3);

    //example of two-dimensional dynamic array
    int* pd_arr[2];
    pd_arr[0] = malloc(sizeof(int) * 2);
    pd_arr[1] = malloc(sizeof(int) * 2);

    printf("Hello,world!\n");//example of standard output

    //example of memory leak
    free(pd_arr[0]);
    return 0;
}`;
const editor = createEditor('editorMain', true, defaultSourceCode);
/*const consolEditor =*/ createConsoleEditor('output', '', editor);

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
    const canvas1 = document.getElementById('display');
    // const editorMain = document.getElementById("editorMain");
    let queue = null;
    let wait = 300;

    // Canvasサイズをコンテナの100%に
    const setCanvasSize = () => {
      canvas1.width = 0.97 * container.offsetWidth;
      canvas1.height = 0.95 * window.innerHeight;

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
});
$('#language-swicher').on('toggle', (e, active) => {
  if (active) {
    showLanguage('jp'); // 日本語を表示 詳細後述
  } else {
    showLanguage('en'); // 英語を表示
  }
});

showLanguage('en'); // デフォルトの言語
