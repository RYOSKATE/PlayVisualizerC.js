import { dispLoading, removeLoading } from './window';

const file_upload = () => {
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

const deleteFile = (filename) => {
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

const jsonStrFormat = (jsonStr) => {
    return jsonStr.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
}

const setFileListFromJson = (jsonText) => {
    const jsonFromIndexStr = jsonText;// @Html(Json.stringify(Json.toJson(jsonStrFromIndex)));
    const fomattedJsonFromIndexStr = jsonStrFormat(jsonFromIndexStr);
    const jsonFromIndex = JSON.parse(fomattedJsonFromIndexStr);

    if ('filenames' in jsonFromIndex) {
        ResetAllFileList(jsonFromIndex.filenames);
    }
}


const ResetAllFileList = (filelist) => {　　　　//全て削除して再セット
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
