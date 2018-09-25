import { drawMemoryState } from './painter';
import { dispLoading, removeLoading } from './window';
import server from './server';

export const createConsoleEditor = (idName, text, sourceCodeEditor) => {
    require('ace-min-noconflict');
    require('ace-min-noconflict/mode-c_cpp');
    require('ace-min-noconflict/theme-terminal');
    const outputEditor = ace.edit(idName);
    outputEditor.setReadOnly(true);
    outputEditor.$blockScrolling = Infinity;
    outputEditor.setTheme("ace/theme/terminal");
    const id = '#' + idName
    $(id).on('keydown', function () {
        if (window.GlobalStorage.isScanf == "true") {
            outputEditor.setReadOnly(false);
        }
    });
    $(id).on('keyup', function (e) {
        const isDuringScanf = window.GlobalStorage.isScanf == "true";
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
            window.GlobalStorage.isScanf = "false";
            send(jsondata, sourceCodeEditor);
        }
    });
    outputEditor.setValue(text, 1);
    return outputEditor;
}
export const createEditor = (idName, canWrite, initText) => {
    require('ace-min-noconflict');
    require('ace-min-noconflict/mode-c_cpp');
    require('ace-min-noconflict/theme-monokai');
    const sourceCodeEditor = ace.edit(idName);
    if (canWrite) {
        sourceCodeEditor.$blockScrolling = Infinity;
        // sourceCodeEditor.setOptions({
        //     enableBasicAutocompletion: true,//基本的な自動補完
        //     enableSnippets: true,//スニペット
        //     enableLiveAutocompletion: true//ライブ補完
        // });
    }
    sourceCodeEditor.setTheme("ace/theme/monokai");
    sourceCodeEditor.getSession().setMode("ace/mode/c_cpp");//シンタックスハイライトと自動補完
    //sourceCodeEditor.getSession().setUseWrapMode(true);//true:折り返し、false:横スクロールバー

    $('#font-size').click(function (e) {
        sourceCodeEditor.setFontSize($(e.target).data('size'));
    });

    sourceCodeEditor.setReadOnly(!canWrite);

    if (canWrite) {
        const showNotDebuggingMsg = () => {
            alert("デバッグ開始ボタンを押してください");
            $('canvas').clearCanvas();
        };
        $('#debug').click(function () {
            const text = sourceCodeEditor.getValue();
            if (text.length <= 1) {
                alert("ソースコードがありません！");
                $('canvas').clearCanvas();
            }
            else {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "debug",
                    "output": "",
                    "sourcetext": text
                };
                send(jsondata, sourceCodeEditor);
                window.GlobalStorage.line = 0;
                window.GlobalStorage.debug = "true";
            }
        });
        $('#reset').click(function () {
            if (window.GlobalStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "reset",
                    "output": "",
                    "sourcetext": sourceCodeEditor.getValue()
                };
                send(jsondata, sourceCodeEditor);
            }
            else {
                showNotDebuggingMsg();
            }
        });
        $('#exec').click(function () {
            if (window.GlobalStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "exec",
                    "output": "",
                    "sourcetext": sourceCodeEditor.getValue()
                };
                send(jsondata, sourceCodeEditor);
            }
            else {
                showNotDebuggingMsg();
            }
        });

        $('#step').click(function () {
            if (window.GlobalStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "step",
                    "output": "",
                    "sourcetext": sourceCodeEditor.getValue()
                };
                send(jsondata, sourceCodeEditor);
            }
            else {
                showNotDebuggingMsg();
            }
        });
        $('#back').click(function () {
            if (window.GlobalStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "back",
                    "output": "",
                    "sourcetext": sourceCodeEditor.getValue()
                };
                send(jsondata, sourceCodeEditor);
            }
            else {
                showNotDebuggingMsg();
            }

        });
        $('#stop').click(function () {
            if (window.GlobalStorage.debug == "true") {
                const jsondata = { //送りたいJSONデータ
                    "stackData": "",
                    "debugState": "stop",
                    "output": "",
                    "sourcetext": sourceCodeEditor.getValue()
                };
                send(jsondata, sourceCodeEditor);
                $('canvas').clearCanvas();
                window.GlobalStorage.debug = "false";
                window.GlobalStorage.line = 0;
            }
            else {
                showNotDebuggingMsg();
            }
        });
    }

    if (initText != '')
        sourceCodeEditor.setValue(initText, -1);
    return sourceCodeEditor;
}

const drawVisualizedResult = (jsondata, editor) => {
    const treeJson = jsondata.stackData;
    const treeObj = treeJson;
    const data = new Array(treeObj);

    if (window.GlobalStorage.debug != "true") {
    } else {
        // document.getElementById("exstart").disabled = "true";
        require('ace-min-noconflict');
        const Range = ace.require("ace/range").Range;
        const d = data[0];
        const codeRange = d.nextExpr.codeRange;
        if (jsondata.debugState == "EOF") {
            const range = new Range(new Number(-1), new Number(0), new Number(-1), new Number(1));
            editor.getSelection().setSelectionRange(range);
        }
        else if (codeRange) {
            const range = new Range(new Number(codeRange.begin.y - 1), new Number(codeRange.begin.x), new Number(codeRange.end.y - 1), new Number(codeRange.end.x + 1));
            editor.getSelection().setSelectionRange(range);
        }
        // const nextLineEditOutput = jsondata.output.replace(/\\n/g, '\n');
        createConsoleEditor("output", jsondata.output);
        drawMemoryState(d, 1);
    }
}

const send = (jsondata, editor) => {
    if (jsondata.debugState == "debug") {
        dispLoading("コンパイル中...");
    }
    setTimeout(() => {// コンパイル中の文字を表示が画面に反映されるのを待つため。
        new Promise((resolve, reject) => {
            const ret = server.ajaxCall(jsondata);
            if (ret != null) {
                resolve(ret);
            } else {
                reject();
            }
        }).then((ret) => {
            document.getElementById("debugStatus").innerHTML = "DebugStatus:" + ret.debugState;
            if (ret.debugState == "scanf") {
                window.GlobalStorage.isScanf = "true";
            }
            drawVisualizedResult(ret, editor);
        }).catch((e) => {
            alert("invalid data");
            console.error(e);
        }).finally(() => {
            removeLoading();
        });
    }, 100);
}
