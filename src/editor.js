import { CanvarDrawer } from './painter';
import { dispLoading, removeLoading } from './window';
import server from './server';

import {restartLogging, stopLogging ,addLog, saveLog} from './log';

export const createConsoleEditor = (idName, text, sourceCodeEditor) => {
  require('ace-min-noconflict');
  require('ace-min-noconflict/mode-c_cpp');
  require('ace-min-noconflict/theme-terminal');
  const outputEditor = ace.edit(idName);
  outputEditor.setReadOnly(true);
  outputEditor.$blockScrolling = Infinity;
  outputEditor.setTheme('ace/theme/terminal');
  const id = '#' + idName;
  $(id).on('keydown', function() {
    if (window.GlobalStorage.isStdin === true) {
      outputEditor.setReadOnly(false);
    }
  });
  $(id).on('keyup', function(e) {
    const isDuringScanf = window.GlobalStorage.isStdin === true;
    if (!isDuringScanf) {
      outputEditor.setReadOnly(true);
    }
    const enterKeyCode = 13;
    if (e.keyCode == enterKeyCode && isDuringScanf) {
      let stdinText = outputEditor.getValue();
      stdinText = stdinText.substr(0, stdinText.length - 1); //改行文字削除
      stdinText = stdinText.replace(server.getLastOutputText(), '');
      const jsondata = {
        //送りたいJSONデータ
        stackData: '',
        debugState: 'step',
        output: '',
        sourcetext: '',
        stdinText,
      };
      window.GlobalStorage.isStdin = false;
      send(jsondata, sourceCodeEditor);
    }
  });

  outputEditor.setValue(text, 1);
  return outputEditor;
};
export const createEditor = (idName, canWrite, initText) => {
  require('ace-min-noconflict');
  require('ace-min-noconflict/mode-c_cpp');
  require('ace-min-noconflict/theme-monokai');
  require('ace-min-noconflict/ext-language_tools');
  const sourceCodeEditor = ace.edit(idName);
  if (canWrite) {
    sourceCodeEditor.$blockScrolling = Infinity;
    sourceCodeEditor.setOptions({
      enableBasicAutocompletion: true, //基本的な自動補完
      enableSnippets: true, //スニペット
      enableLiveAutocompletion: true, //ライブ補完
    });

    let lineNumOfBreakpoint = [];

    sourceCodeEditor.on("guttermousedown", (e) => {
      const target = e.domEvent.target; 
      if (target.className.indexOf("ace_gutter-cell") == -1) 
          return; 
      if (!sourceCodeEditor.isFocused()) 
          return; 
      if (e.clientX > 25 + target.getBoundingClientRect().left) 
          return; 

      const row = e.getDocumentPosition().row;

      if( lineNumOfBreakpoint.includes(row) ) {
          e.editor.session.clearBreakpoint(row);
          lineNumOfBreakpoint = lineNumOfBreakpoint.filter(n => n !== row);
      } else{
          e.editor.session.setBreakpoint(row) ;
          lineNumOfBreakpoint.push(row);
      } 
      e.stop() ;
    });

    
    const showNotDebuggingMsg = () => {
      alert('デバッグ開始ボタンを押してください');
      CanvarDrawer.clearMemoryState();
    };
    $('#debug').click(function() {      
      const text = sourceCodeEditor.getValue();
      if (text.length <= 1) {
        alert('ソースコードがありません！');
        CanvarDrawer.clearMemoryState();        
      } else {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'debug',
          output: '',
          sourcetext: text,
        };
        send(jsondata, sourceCodeEditor);
        window.GlobalStorage.line = 0;
        window.GlobalStorage.debug = true;
        $("#stop").prop("disabled", false);
        $("#reset").prop("disabled", false);
        $("#back").prop("disabled", false);
        $("#step").prop("disabled", false);
        $("#exec").prop("disabled", false);
      }
    });
    $('#reset').click(function() {      
      if (window.GlobalStorage.debug == true) {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'reset',
          output: '',
          sourcetext: sourceCodeEditor.getValue(),
        };
        send(jsondata, sourceCodeEditor);
        $("#reset").prop("disabled", true);
        $("#back").prop("disabled",  true);
      } else {
        showNotDebuggingMsg();
      }
    });
    $('#exec').click(function() {      
      if (window.GlobalStorage.debug == true) {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'exec',
          output: '',
          sourcetext: sourceCodeEditor.getValue(),
          lineNumOfBreakpoint,
        };
        send(jsondata, sourceCodeEditor);
        
      } else {
        showNotDebuggingMsg();
      }
    });

    $('#step').click(function() {      
      if (window.GlobalStorage.debug == true) {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'step',
          output: '',
          sourcetext: sourceCodeEditor.getValue(),
        };
        send(jsondata, sourceCodeEditor);
      } else {
        showNotDebuggingMsg();
      }
    });
    $('#back').click(function() {      
      if (window.GlobalStorage.debug == true) {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'back',
          output: '',
          sourcetext: sourceCodeEditor.getValue(),
        };
        send(jsondata, sourceCodeEditor);
      } else {
        showNotDebuggingMsg();
      }
    });
    $('#stop').click(function() {      
      if (window.GlobalStorage.debug == true) {
        const jsondata = {
          //送りたいJSONデータ
          stackData: '',
          debugState: 'stop',
          output: '',
          sourcetext: sourceCodeEditor.getValue(),
        };
        send(jsondata, sourceCodeEditor);
        CanvarDrawer.clearMemoryState();
        window.GlobalStorage.debug = false;
        window.GlobalStorage.line = 0;

        $("#stop").prop("disabled", true);
        $("#reset").prop("disabled", true);
        $("#back").prop("disabled", true);
        $("#step").prop("disabled", true);
        $("#exec").prop("disabled", true);
      } else {
        showNotDebuggingMsg();
      }
    });
  }
  sourceCodeEditor.setTheme('ace/theme/monokai');
  sourceCodeEditor.getSession().setMode('ace/mode/c_cpp'); //シンタックスハイライトと自動補完
  //sourceCodeEditor.getSession().setUseWrapMode(true);//true:折り返し、false:横スクロールバー

  $('#font-size').click(function(e) {
    addLog('#font-size');
    sourceCodeEditor.setFontSize($(e.target).data('size'));
  });

  sourceCodeEditor.setReadOnly(!canWrite);

  if (initText != '') sourceCodeEditor.setValue(initText, -1);
  return sourceCodeEditor;
};

const drawVisualizedResult = (jsondata, editor) => {
  const treeJson = jsondata.stackData;
  const treeObj = treeJson;
  const data = new Array(treeObj);

  if (window.GlobalStorage.debug == true) {
    // document.getElementById("exstart").disabled = "true";
    require('ace-min-noconflict');
    const Range = ace.require('ace/range').Range;
    const d = data[0];
    const codeRange = d.nextExpr.codeRange;

    const step = jsondata.step;
    $("#reset").prop("disabled", step <= 0);
    $("#back").prop("disabled",  step <= 0);

    const isEOF = jsondata.debugState === 'EOF';
    $("#step").prop("disabled", isEOF);
    $("#exec").prop("disabled", isEOF);
    if (isEOF) {
      const range = new Range(new Number(-1), new Number(0), new Number(-1), new Number(1));
      editor.getSelection().setSelectionRange(range);
    } else if (codeRange) {
      const range = new Range(
        new Number(codeRange.begin.y - 1),
        new Number(codeRange.begin.x),
        new Number(codeRange.end.y - 1),
        new Number(codeRange.end.x + 1),
      );
      editor.getSelection().setSelectionRange(range);
    }
    // const nextLineEditOutput = jsondata.output.replace(/\\n/g, '\n');
    createConsoleEditor('output', jsondata.output);
    
    const canvasDrawer = new CanvarDrawer();
    
    $('#canvasScaleRange').change(() => { 
      const value = $('#canvasScaleRange').val();
      const scale = Number(value);   
      $('#canvasScaleRangeVal').text(scale);
      canvasDrawer.rescale(scale);
    });

    const value = $('#canvasScaleRange').val();
    const scale = Number(value);   
    $('#canvasScaleRangeVal').text(scale);
    canvasDrawer.drawMemoryState(d);
    canvasDrawer.rescale(scale);
  }
};

const send = (jsondata, editor) => {
  if (jsondata.debugState == 'debug') {
    dispLoading('コンパイル中...');
  }
  setTimeout(() => {
    // コンパイル中の文字を表示が画面に反映されるのを待つため。
    new Promise((resolve, reject) => {
      const ret = server.ajaxCall(jsondata);
      if (ret != null) {
        resolve(ret);
      } else {
        reject();
      }
    })
      .then((ret) => {
        addLog(ret.preDebugState, ret.step);
        document.getElementById('debugStatus').innerHTML = 'DebugStatus:' + ret.debugState;
        if (ret.debugState == 'stdin') {
          window.GlobalStorage.isStdin = true;
        }
        drawVisualizedResult(ret, editor);
      })
      .catch((e) => {
        alert('invalid data');
        console.error(e);
      })
      .finally(() => {
        removeLoading();
      });
  }, 100);
};
