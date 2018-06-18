import Server from './server';
const server = new Server();

function jsonStrFormat(jsonStr) {
  return jsonStr.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
}
var jsonFromIndexStr = '{}';// @Html(Json.stringify(Json.toJson(jsonStrFromIndex)));
var fomattedJsonFromIndexStr = jsonStrFormat(jsonFromIndexStr);
var jsonFromIndex = JSON.parse(fomattedJsonFromIndexStr);
if ('pageTitle' in jsonFromIndex) {
  setEditorAndExperiment(jsonFromIndex.pageTitle);
}

if ('filenames' in jsonFromIndex) {
  ResetAllFileList(jsonFromIndex.filenames);
}



// Loadingイメージ表示関数
function dispLoading(msg) {
  // 画面表示メッセージ
  var dispMsg = "";

  // 引数が空の場合は画像のみ
  if (msg != "") {
    dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
  }
  // ローディング画像が表示されていない場合のみ表示
  if ($("#loading").size() == 0) {
    $("body").append("<div id='loading'>" + dispMsg + "</div>");
  }
}

// Loadingイメージ削除関数
function removeLoading() {
  $("#loading").remove();
}

var text = '';
if (localStorage.sourcefile) {
  text = localStorage.sourcefile;
}

var editor = createEditor('editorMain', true, text);

if (localStorage.currentex == "ex1" || localStorage.currentex == "ex2" || localStorage.currentex == "ex3" || localStorage.currentex == "ex4") {
  editor.setReadOnly(true);
}

var consolEditor = createConsoleEditor("output", "");

function deleteFile(filename) {
  var url = "/delete/" + filename;
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    contentType: 'text/json',
    success: function (data) {
      ResetAllFileList(data.filenames)
    },
    error: function (data) {
      alert("Fail to delete");
    },
    complete: function (data) {
      // Loadingイメージを消す
      removeLoading();
    }
  });
}

function ResetAllFileList(filelist) {　　　　//全て削除して再セット
  var parElm = document.getElementById('filelist');
  var list = parElm.getElementsByTagName('li');
  for (var i = list.length - 1; i >= 0; --i) {　　//末尾から順にすべて削除
    parElm.removeChild(list[i]);
  }

  for (var i = 0; i < filelist.length; ++i) {
    var filename = filelist[i];
    var item = document.createElement("li");//li要素を作成

    var buttunElement = document.createElement("button");
    buttunElement.style.cssText = "text-align : right";
    buttunElement.className = "btn btn-default glyphicon glyphicon-trash";
    buttunElement.onclick = (function wrap(filename_) {
      return function () { deleteFile(filename_); }
    })(filename);

    item.appendChild(buttunElement);

    var whiteSpaceElement = document.createElement("span");
    whiteSpaceElement.innerHTML = "　";

    item.appendChild(whiteSpaceElement);

    var aTagElement = document.createElement("a");
    aTagElement.href = "/download/" + filename;
    aTagElement.appendChild(document.createTextNode(filename));

    item.appendChild(aTagElement);

    parElm.appendChild(item);//sample_container要素に追加
  }
}

function file_upload() {
  // フォームデータを取得
  var form = $('#my-form');
  var formdata = new FormData(form[0]);
  dispLoading("送信中...");
  // POSTでアップロード
  $.ajax({
    url: "/upload",
    type: "POST",
    data: formdata,
    cache: false,
    contentType: false,
    processData: false,
    dataType: "html",
    success: function (data) {
      var jsondata = JSON.parse(data);
      ResetAllFileList(jsondata.filenames)
      //alert(jsondata.filenames);
    },
    error: function (data) {
      alert("invalid data");
    },
    complete: function (data) {
      // Loadingイメージを消す
      removeLoading();
    }
  });
}

//Visualizer.js
/**
 * Created by ryosuke on 2016/05/26.
 */
/*可視化領域描画処理*/
//$(function(){
$(document)
  .on('click', '.popup_btn', function () {
    // ポップアップの幅と高さからmarginを計算する
    var mT = ($('#popup1').outerHeight() / 2) * (-1) + 'px';
    var mL = ($('#popup1').outerWidth() / 2) * (-1) + 'px';

    // marginを設定して表示
    $('.popup').hide();
    $('#popup1').css({
      'margin-top': mT,
      'margin-left': mL
    }).show();
    $('#overlay').show();

    return false;
  })
  .on('click', '.close_btn, #overlay', function () {
    $('.popup, #overlay').hide();
    return false;
  });
window.addEventListener("load", function () {
  var container = document.getElementById("canvasContainer"),
    canvas1 = document.getElementById("display"),
    editorMain = document.getElementById("editorMain"),
    queue = null,
    wait = 300;

  // ページ読込時にCanvasサイズ設定
  setCanvasSize();

  // リサイズ時にCanvasサイズを再設定
  window.addEventListener("resize", function () {
    clearTimeout(queue);
    queue = setTimeout(function () {
      setCanvasSize();
    }, wait);
  }, false);

  // Canvasサイズをコンテナの100%に
  function setCanvasSize() {
    canvas1.width = 0.97 * container.offsetWidth;
    canvas1.height = 0.95 * window.innerHeight;

    var height = $(window).height() - 180;
    $("#editorMain").css("height", 0.8 * Math.max(height, 500) + "px");
    $("#output").css("height", 0.22 * Math.max(height, 500) + "px");
    editor.resize()
  }

}, false);
function drawMemoryState(data) {

  //一度全て削除する
  $('canvas').clearCanvas();
  var alllayers = $('canvas').getLayers();
  for (var i = alllayers.length - 1; 0 <= i; --i)
    $('canvas').removeLayer(alllayers[i]).drawLayers();


  $.jCanvas.defaults.fromCenter = false;//座標を図形の中央ではなく左上に
  $.jCanvas.defaults.layer = true;//図形のレイヤー処理を有効化(グループ処理)
  $.jCanvas.defaults.drag = onDrag; // Dragされた
  $('canvas').setLayer('mainLayer', {
    visible: false//高速化・ちらつき防止のため最終的な状態になるまで描画しない
  }).drawLayers();

  var origin = new Victor(50, 50);//図形描画の基準位置
  var nextPos = origin.clone();//次のRectの左上の位置

  var stacks = data.stacks;
  for (var i = 0, len = stacks.length; i < len; ++i) {
    drawStack(stacks[i]);//それぞれのスタックについて描画
  }


  function drawStack(stack) {
    var pos = nextPos.clone();//次の変数の左上の位置
    var memoryName = stack.name;//nameはその関数名など
    var variables = stack.variables;//変数一覧
    var numOfVars = variables.length;

    if (0 < numOfVars)//そのスタック内の変数を全て描画
    {
      drawText(memoryName, pos.x, pos.y, memoryName, memoryName);
      var heightOffset = 25;
      var borderHeight = heightOffset;
      var maxWidths = [0, 0, 0, 0];//型名、変数名、値、&変数名(メモリアドレス)の順番、配列の場合は1列目空欄で4列目を追加。(2次元なら3,4,5列)
      var numOfRow = 0;
      function makeVariables(numOfVars, variables, col) {
        for (var i = 0; i < numOfVars; ++i, ++numOfRow) {
          pos.addY(new Victor(0, heightOffset))
          var v = variables[i];
          var name = memoryName + "-" + v.name;//ユニークな名前: スタック名+変数名+列名+テキスト
          drawVariable(v.type, pos.x, pos.y, name + "-type", memoryName);
          var typeWidth = $("#display").getLayer(name + "-type" + "-text").width;

          drawVariable(v.name, pos.x + typeWidth, pos.y, name + "-name", memoryName);
          var nameWidth = $("#display").getLayer(name + "-name" + "-text").width;

          var value = v.value;
          var address = "0x" + v.address.toString(16)
          if (v.value instanceof Array) {
            value = "0x" + v.value[0].address.toString(16);
            address = "SYSTEM";
          }
          if (~v.type.indexOf("*") && v.value != null)
            value = "0x" + value.toString(16);
          drawVariable(value, pos.x + typeWidth + nameWidth, pos.y, name + "-value", memoryName);
          var valueWidth = Math.max($("#display").getLayer(name + "-value" + "-text").width, 80);

          drawVariable("&" + v.name + "(" + address + ")", pos.x + typeWidth + nameWidth + valueWidth, pos.y, name + "-address", memoryName);
          var addressWidth = $("#display").getLayer(name + "-address" + "-text").width;


          //列を揃えるために最大幅を計算
          maxWidths[col] = Math.max(maxWidths[col], typeWidth);
          maxWidths[col + 1] = Math.max(maxWidths[col + 1], nameWidth);
          maxWidths[col + 2] = Math.max(maxWidths[col + 2], valueWidth);
          if (col + 3 < maxWidths.length)
            maxWidths[col + 3] = Math.max(maxWidths[col + 3], addressWidth);
          else
            maxWidths[col + 3] = addressWidth;

          borderHeight += heightOffset;

          if (v.value instanceof Array) {
            pos.addX(new Victor(maxWidths[col], 0))
            makeVariables(v.value.length, v.value, col + 1);
            pos.addX(new Victor(-maxWidths[col], 0))
          }
        }
      }
      makeVariables(numOfVars, variables, 0);
      //各列の最大幅に合わせてx座標修正
      var memoryTextLayer = $("#display").getLayer(memoryName + "-text");
      var borderWidth = Math.max(memoryTextLayer.width, maxWidths.reduce(function (x, y) { return x + y; }));
      memoryTextLayer.x = memoryTextLayer.x + (borderWidth / 2) - (memoryTextLayer.width / 2);
      function redrawVariable(numOfVars, variables, col) {
        for (var i = 0; i < numOfVars; ++i) {
          var v = variables[i];
          var name = memoryName + "-" + v.name;//ユニークな名前: スタック名+変数名+列名+テキスト
          var leftPosX = $("#display").getLayer(name + "-type" + "-text").x;
          $("#display").getLayer(name + "-name" + "-text").x = leftPosX + maxWidths[col];
          $("#display").getLayer(name + "-value" + "-text").x = leftPosX + maxWidths[col] + maxWidths[col + 1];
          $("#display").getLayer(name + "-address" + "-text").x = leftPosX + maxWidths[col] + maxWidths[col + 1] + maxWidths[col + 2];
          if (v.value instanceof Array) {
            redrawVariable(v.value.length, v.value, col + 1);
          }
        }
      }
      redrawVariable(numOfVars, variables, 0);

      //スタックを囲む四角形を描画
      var posTopLeft = nextPos.clone().add(new Victor(-5, -5));
      $("#display").drawRect({
        strokeStyle: "black",
        strokeWidth: 1,
        x: posTopLeft.x,
        y: posTopLeft.y,
        width: borderWidth + 10,
        height: borderHeight,
        draggable: true,
        name: memoryName + "-rect",
        groups: [memoryName],
        dragGroups: [memoryName]/*,
                click: function (layer) {
                    // Click a star to spin it
                    $(this).animateLayer(layer, {
                        rotate: '+=360'
                    })
                }*/
      });


      function drawLine(start, end, name, groupname) {
        $('#display').drawLine({
          strokeStyle: '#000',
          strokeWidth: 1,
          x1: start.x, y1: start.y,
          x2: end.x, y2: end.y,
          name: name,
          groups: [groupname],
          dragGroups: [groupname]
        });
      }

      //列単位で縦線を描画
      var memoryRectLayer = $("#display").getLayer(memoryName + "-rect");
      var start = new Victor(memoryRectLayer.x + 5, memoryRectLayer.y + heightOffset);
      var end = start.clone().addY(new Victor(0, memoryRectLayer.height - heightOffset));
      for (var i = 0; i < maxWidths.length - 1; ++i) {
        drawLine(start.addX(new Victor(maxWidths[i], 0)), end.addX(new Victor(maxWidths[i], 0)), memoryName + "_" + i + "-colline", memoryName);
      }
      //変数単位で横線を描画
      var lineLeft = posTopLeft.clone();
      var lineRight = lineLeft.clone().addX(new Victor(borderWidth + 10, 0));
      for (var i = 0; i < numOfRow; ++i) {
        var start = lineLeft.addY(new Victor(0, heightOffset));
        var end = lineRight.addY(new Victor(0, heightOffset));
        var name = memoryName + "_" + i + "-rowline";
        var groupname = memoryName;
        drawLine(start, end, name, groupname);
      }
      nextPos = pos.add(new Victor(50, heightOffset + 10)).clone();
    }
  }

  function drawText(text, x, y, name, groupname) {
    $("#display").drawText({
      fillStyle: "black",
      strokeStyle: "black",
      strokeWidth: "0.5",
      x: x,
      y: y,
      fontSize: 14,
      fontFamily: "sans-serif",
      text: " " + text + " ",
      name: name + "-text",//スタック名-変数名-列名-text
      draggable: true,
      groups: [groupname],//スタック名,変数名
      dragGroups: [groupname]//スタック名,変数名
    });
  }

  function drawVariable(t, x, y, name, groupname) {
    $("#display").drawText({
      fillStyle: "black",
      strokeStyle: "black",
      strokeWidth: "0.5",
      x: x,
      y: y,
      fontSize: 14,
      fontFamily: "sans-serif",
      text: "   " + t + "   ",
      name: name + "-text",//スタック名-変数名-列名-text
      draggable: true,
      groups: [groupname],//スタック名,変数名
      dragGroups: [groupname],//スタック名,変数名
    });
  }

  function drawArrow(start, mid, end, name, fromGroup, toGroup) {
    $('#display').drawQuadratic({
      strokeStyle: 'rgba(0, 0, 0, 0.5)',
      //fillStyle : 'rgba(0, 0, 0, 0.7)',
      strokeWidth: 3,
      rounded: true,
      endArrow: true,
      arrowRadius: 15,
      arrowAngle: 60,
      x1: start.x, y1: start.y,
      cx1: mid.x, cy1: mid.y,
      x2: end.x, y2: end.y,
      name: name + "-arrow",
      drag: onDrag, // Dragされた
      groups: [fromGroup, toGroup],
      dragGroups: [fromGroup, toGroup]
    })
  }
  var selectColorIndex = 0;
  var colorHashMap = {};
  function getColorSet() {
    var array = [
      'rgba(255, 40, 0, 0.5)',
      //'rgba(250, 245, 0, 0.5)',
      'rgba(53, 161, 107, 0.5)',
      'rgba(0, 65, 255, 0.5)',
      'rgba(102, 204, 255, 0.7)',
      'rgba(255, 153, 160, 0.5)',
      'rgba(255, 153, 0, 0.5)',
      'rgba(154, 0, 121, 0.5)',
      'rgba(102, 51, 0, 0.5)'
    ];
    var select = array[selectColorIndex++];

    if (array.length <= selectColorIndex)
      selectColorIndex = 0;
    return select;
    //アドレスから矢印描画
  }
  //アドレスから矢印描画
  function drawAllPtrArrow() {
    for (var i = 0, memlen = stacks.length; i < memlen; ++i) {
      var variables = stacks[i].variables;
      var varlen = stacks[i].variables.length;

      function drawPtrArrow(varlen, variables, col) {
        for (var j = 0; j < varlen; ++j) {
          var val = variables[j];
          var isTypePtr = (val.type.indexOf('*') != -1);
          if (isTypePtr || val.value instanceof Array) {
            var layerName = stacks[i].name + "-" + val.name + "-value" + "-text";
            var fromValue = $("#display").getLayer(layerName);
            var x = $("#display").getLayer(stacks[i].name + "-rect").x;
            var y = fromValue.y + fromValue.height / 2;
            var from = new Victor(x, y);

            for (var i2 = 0, memlen2 = stacks.length; i2 < memlen2; ++i2) {
              var variables2 = stacks[i2].variables;
              var varlen2 = stacks[i2].variables.length;

              function drawPtrArrow2(varlen2, variables2, col2) {
                for (var j2 = 0; j2 < varlen2; ++j2) {
                  var val2 = variables2[j2];

                  var isArrayNamePtr = val.value instanceof Array && val2.name == val.name + "[0]";
                  if (isArrayNamePtr || val2.address == val.value) {
                    var layerName2 = stacks[i2].name + "-" + val2.name + "-address" + "-text";
                    var toValue = $("#display").getLayer(layerName2);
                    var x2 = $("#display").getLayer(stacks[i2].name + "-rect").x;
                    var y2 = toValue.y + toValue.height / 2;
                    var to = new Victor(x2, y2);

                    var mid = new Victor((from.x + to.x) / 2, (from.y + to.y) / 2);
                    var dir = (to.clone().subtract(from.clone()));
                    var length = dir.length();
                    dir.normalize();
                    if (y < y2)
                      dir.rotateDeg(90);
                    else
                      dir.rotateDeg(-90);

                    mid.add(dir.multiply(new Victor(length / 4, length / 4)));

                    var name = stacks[i].name + "-" + val.name + "-to-" + stacks[i2].name + "-" + val2.name;
                    drawArrow(from, mid, to, name, stacks[i].name, stacks[i2].name);//もう一つ必要
                    var color;
                    if (name in colorHashMap) {
                      color = colorHashMap[name]
                    }
                    else {
                      color = getColorSet();
                      colorHashMap[name] = color;
                    }
                    fromValue.strokeStyle = color;
                    $("#display").getLayer(name + "-arrow").strokeStyle = color;
                    toValue.strokeStyle = color;
                  }
                  else if (val2.value instanceof Array) {
                    drawPtrArrow2(val2.value.length, val2.value, col2 + 1);
                  }
                }
              }

              drawPtrArrow2(varlen2, variables2, 0);
            }
          }
          if (val.value instanceof Array) {
            drawPtrArrow(val.value.length, val.value, col + 1);
          }
        }
      }

      drawPtrArrow(varlen, variables, 0);
    }
  }
  drawAllPtrArrow();
  function onDrag(layer) {
    var layers = $('canvas').getLayers()
    for (var i = 0; i < layers.length; ++i) {
      if (~layers[i].name.indexOf("-arrow")) {
        $("#display").removeLayer(layers[i].name);
        i = 0;
      }
    }
    drawAllPtrArrow();
  }
  $('canvas').getLayers().reverse();//スタックのRectが最前面になり内側に対するマウスイベントを全て全て受け取ってしまう。
  $('canvas').setLayer('mainLayer', {
    visible: true//ここまでの処理が終わって初めて描画する
  }).drawLayers();

  return data;
}
//});

//visualizerEditor.js
/**
 * Created by RYOSUKE on 2017/04/04.
 */

function send(jsondata) {
  if (jsondata.debugState == "debug") {
    dispLoading("コンパイル中...");
  }
  const ret = server.ajaxCall(jsondata);
  if (ret != null) {
    document.getElementById("debugStatus").innerHTML = "DebugStatus:" + ret.debugState;
    if (ret.debugState == "scanf") {
      localStorage.isScanf = "true";
    }
    drawVisualizedResult(ret);
  } else {
    alert("invalid data");
  }
  removeLoading();
}

function createConsoleEditor(idName, text) {
  require('ace-min-noconflict');
  require('ace-min-noconflict/mode-c_cpp');
  require('ace-min-noconflict/theme-terminal');
  var outputEditor = ace.edit(idName);
  outputEditor.setReadOnly(true);
  outputEditor.$blockScrolling = Infinity;
  outputEditor.setTheme("ace/theme/terminal");
  var id = '#' + idName
  $(id).on('keydown', function (e) {
    if (localStorage.isScanf == "true") {
      outputEditor.setReadOnly(false);
    }
  });
  $(id).on('keyup', function (e) {
    var isDuringScanf = localStorage.isScanf == "true";
    if (!isDuringScanf) {
      outputEditor.setReadOnly(true);
    }
    var enterKeyCode = 13;
    if (e.keyCode == enterKeyCode && isDuringScanf) {
      var text = outputEditor.getValue();
      text = text.substr(0, text.length - 1);//改行文字削除
      var pos = text.lastIndexOf('\n');
      text = text.substr(pos + 1);
      var jsondata = { //送りたいJSONデータ
        "stackData": "",
        "debugState": "step",
        "output": "",
        "sourcetext": "",
        "stdinText": text
      };
      localStorage.isScanf = "false";
      send(jsondata);
    }
  });
  outputEditor.setValue(text, 1);
  return outputEditor;
}
function createEditor(idName, canWrite, initText) {
  require('ace-min-noconflict');
  require('ace-min-noconflict/mode-c_cpp');
  require('ace-min-noconflict/theme-monokai');
  var editor = ace.edit(idName);
  if (canWrite) {
    editor.$blockScrolling = Infinity;
    editor.setOptions({
      enableBasicAutocompletion: true,//基本的な自動補完
      enableSnippets: true,//スニペット
      enableLiveAutocompletion: true//ライブ補完
    });
  }
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/c_cpp");//シンタックスハイライトと自動補完
  //editor.getSession().setUseWrapMode(true);//true:折り返し、false:横スクロールバー


  $('#font-size').click(function (e) {
    editor.setFontSize($(e.target).data('size'));
  });

  editor.setReadOnly(!canWrite);

  if (canWrite) {
    $('#debug').click(function (e) {
      var text = editor.getValue();
      if (text.length <= 1) {
        alert("ソースコードがありません！")
      }
      else {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "debug",
          "output": "",
          "sourcetext": text
        };
        send(jsondata);
        localStorage.line = 0;
        localStorage.debug = "true";
      }
    });
    $('#reset').click(function (e) {
      if (localStorage.debug == "true") {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "reset",
          "output": "",
          "sourcetext": editor.getValue()
        };
        send(jsondata);
      }
      else {
        alert("デバッグ開始ボタンを押してください");
      }
    });
    $('#exec').click(function (e) {
      if (localStorage.debug == "true") {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "exec",
          "output": "",
          "sourcetext": editor.getValue()
        };
        send(jsondata);
      }
      else {
        alert("デバッグ開始ボタンを押してください");
      }
    });

    $('#step').click(function (e) {
      if (localStorage.debug == "true") {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "step",
          "output": "",
          "sourcetext": editor.getValue()
        };
        send(jsondata);
      }
      else {
        alert("デバッグ開始ボタンを押してください");
      }
    });
    $('#back').click(function (e) {
      if (localStorage.debug == "true") {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "back",
          "output": "",
          "sourcetext": editor.getValue()
        };
        send(jsondata);
      }
      else {
        alert("デバッグ開始ボタンを押してください");
      }

    });
    $('#stop').click(function (e) {
      if (localStorage.debug == "true") {
        var jsondata = { //送りたいJSONデータ
          "stackData": "",
          "debugState": "stop",
          "output": "",
          "sourcetext": editor.getValue()
        };
        send(jsondata);
        $('canvas').clearCanvas();
        localStorage.debug = "false";
        localStorage.line = 0;
      }
      else {
        alert("デバッグが開始されていません");
      }
    });
  }

  if (initText != '')
    editor.setValue(initText, -1);
  return editor;
}

function drawVisualizedResult(jsondata) {
  var treeJson = jsondata.stackData;
  var treeObj = treeJson;
  var data = new Array(treeObj);

  if (localStorage.debug != "true") {
  } else {
    // document.getElementById("exstart").disabled = "true";
    require("ace-min-noconflict");
    var Range = ace.Range;
    var d = data[0];
    var codeRange = d.currentExpr.codeRange;
    if (jsondata.debugState == "EOF") {
      var range = new Range(new Number(-1), new Number(0), new Number(-1), new Number(1));
      editor.getSelection().setSelectionRange(range);
    }
    else if (codeRange) {
      var range = new Range(new Number(codeRange.begin.y - 1), new Number(codeRange.begin.x), new Number(codeRange.end.y - 1), new Number(codeRange.end.x + 1));
      editor.getSelection().setSelectionRange(range);
    }
    var nextLineEditOutput = jsondata.output.replace(/\\n/g, '\n');
    createConsoleEditor("output", jsondata.output);
    drawMemoryState(d, 1);
  }
}