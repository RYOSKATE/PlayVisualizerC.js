import { drawMemoryState } from './painter';
import { dispLoading, removeLoading } from './window';
import server from './server';

export const createConsoleEditor = (idName, text) => {
    require('ace-min-noconflict');
    require('ace-min-noconflict/mode-c_cpp');
    require('ace-min-noconflict/theme-terminal');
    const outputEditor = ace.edit(idName);
    outputEditor.setReadOnly(true);
    outputEditor.$blockScrolling = Infinity;
    outputEditor.setTheme("ace/theme/terminal");
    const id = '#' + idName
    $(id).on('keydown', function (e) {
        if (localStorage.isScanf == "true") {
            outputEditor.setReadOnly(false);
        }
    });
    $(id).on('keyup', function (e) {
        const isDuringScanf = localStorage.isScanf == "true";
        if (!isDuringScanf) {
            outputEditor.setReadOnly(true);
        }
        const enterKeyCode = 13;
        if (e.keyCode == enterKeyCode && isDuringScanf) {
            let text = outputEditor.getValue();
            text = text.substr(0, text.length - 1);//改行文字削除
            const pos = text.lastIndexOf('\n');
            text = text.substr(pos + 1);
            const jsondata = { //送りたいJSONデータ
                "stackData": "",
                "debugState": "step",
                "output": "",
                "sourcetext": "",
                "stdinText": text
            };
            localStorage.isScanf = "false";
            send(jsondata, editor);
        }
    });
    outputEditor.setValue(text, 1);
    return outputEditor;
}
export const createEditor = (idName, canWrite, initText) => {
    require('ace-min-noconflict');
    require('ace-min-noconflict/mode-c_cpp');
    require('ace-min-noconflict/theme-monokai');
    const editor = ace.edit(idName);
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
            const text = editor.getValue();
            if (text.length <= 1) {
                alert("ソースコードがありません！")
            }
            else {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "debug",
                    "output": "",
                    "sourcetext": text
                };
                send(jsondata, editor);
                localStorage.line = 0;
                localStorage.debug = "true";
            }
        });
        $('#reset').click(function (e) {
            if (localStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "reset",
                    "output": "",
                    "sourcetext": editor.getValue()
                };
                send(jsondata, editor);
            }
            else {
                alert("デバッグ開始ボタンを押してください");
            }
        });
        $('#exec').click(function (e) {
            if (localStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "exec",
                    "output": "",
                    "sourcetext": editor.getValue()
                };
                send(jsondata, editor);
            }
            else {
                alert("デバッグ開始ボタンを押してください");
            }
        });

        $('#step').click(function (e) {
            if (localStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "step",
                    "output": "",
                    "sourcetext": editor.getValue()
                };
                send(jsondata, editor);
            }
            else {
                alert("デバッグ開始ボタンを押してください");
            }
        });
        $('#back').click(function (e) {
            if (localStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "back",
                    "output": "",
                    "sourcetext": editor.getValue()
                };
                send(jsondata, editor);
            }
            else {
                alert("デバッグ開始ボタンを押してください");
            }

        });
        $('#stop').click(function (e) {
            if (localStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "stop",
                    "output": "",
                    "sourcetext": editor.getValue()
                };
                send(jsondata, editor);
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

const drawVisualizedResult = (jsondata, editor) => {
    const treeJson = jsondata.stackData;
    const treeObj = treeJson;
    const data = new Array(treeObj);

    if (localStorage.debug != "true") {
    } else {
        // document.getElementById("exstart").disabled = "true";
        require('ace-min-noconflict');
        const Range = ace.require("ace/range").Range;
        const d = data[0];
        const codeRange = d.currentExpr.codeRange;
        if (jsondata.debugState == "EOF") {
            const range = new Range(new Number(-1), new Number(0), new Number(-1), new Number(1));
            editor.getSelection().setSelectionRange(range);
        }
        else if (codeRange) {
            const range = new Range(new Number(codeRange.begin.y - 1), new Number(codeRange.begin.x), new Number(codeRange.end.y - 1), new Number(codeRange.end.x + 1));
            editor.getSelection().setSelectionRange(range);
        }
        const nextLineEditOutput = jsondata.output.replace(/\\n/g, '\n');
        createConsoleEditor("output", jsondata.output);
        drawMemoryState(d, 1);
    }
}

const send = (jsondata, editor) => {
    if (jsondata.debugState == "debug") {
        dispLoading("コンパイル中...");
    }
    const ret = server.ajaxCall(jsondata);
    if (ret != null) {
        document.getElementById("debugStatus").innerHTML = "DebugStatus:" + ret.debugState;
        if (ret.debugState == "scanf") {
            localStorage.isScanf = "true";
        }
        if (ret) {
            drawVisualizedResult(ret, editor);
        }
    } else {
        alert("invalid data");
    }
    removeLoading();
}
