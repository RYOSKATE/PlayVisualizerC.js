console.log("test");
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
var jsonFromIndexStr = @Html(Json.stringify(Json.toJson(jsonStrFromIndex)));
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

var text = localStorage.sourcefile;

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