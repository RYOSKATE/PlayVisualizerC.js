import { createConsoleEditor, createEditor } from './editor';
import { file_upload } from './file';

const editor = createEditor('editorMain', true, "");
const consolEditor = createConsoleEditor("output", "", editor);

$(document).on('click', '.popup_btn', function () {
  // ポップアップの幅と高さからmarginを計算する
  const mT = ($('#popup1').outerHeight() / 2) * (-1) + 'px';
  const mL = ($('#popup1').outerWidth() / 2) * (-1) + 'px';

  // marginを設定して表示
  $('.popup').hide();
  $('#popup1').css({
    'margin-top': mT,
    'margin-left': mL
  }).show();
  $('#overlay').show();
  return false;
}).on('click', '.close_btn, #overlay', function () {
  $('.popup, #overlay').hide();
  return false;
});

window.addEventListener("load", () => {
  const container = document.getElementById("canvasContainer");
  const canvas1 = document.getElementById("display");
  const editorMain = document.getElementById("editorMain");
  let queue = null;
  let wait = 300;

  // Canvasサイズをコンテナの100%に
  const setCanvasSize = () => {
    canvas1.width = 0.97 * container.offsetWidth;
    canvas1.height = 0.95 * window.innerHeight;

    const height = $(window).height() - 180;
    $("#editorMain").css("height", 0.8 * Math.max(height, 500) + "px");
    $("#output").css("height", 0.22 * Math.max(height, 500) + "px");
    editor.resize()
  }

  // ページ読込時にCanvasサイズ設定
  setCanvasSize();

  // リサイズ時にCanvasサイズを再設定
  window.addEventListener("resize", () => {
    clearTimeout(queue);
    queue = setTimeout(() => {
      setCanvasSize();
    }, wait);
  }, false);
}, false);

document.getElementById('files').addEventListener('change', file_upload, false);