import { dispLoading, removeLoading } from './window';
import server from './server';
export const file_upload = (evt) => {
  dispLoading('Adding files...');
  setTimeout(() => {
    // フォームデータを取得
    new Promise((resolve, reject) => {
      const files = evt.target.files; // FileList object
      const ret = server.upload(files);
      if (ret != null) {
        resolve(ret);
      } else {
        reject();
      }
    })
      .then((/*ret*/) => {
        // ResetAllFileList(ret.filenames);
      })
      .catch(() => {
        alert('Failed to add');
      })
      .finally(() => {
        $('#files').val('');
      });
  }, 100);
};

export const deleteFile = (filename) => {
  dispLoading('Removing the file...');
  setTimeout(() => {
    // フォームデータを取得
    new Promise((resolve, reject) => {
      const ret = server.delete(filename);
      if (ret != null) {
        resolve(ret);
      } else {
        reject();
      }
    })
      .then((/*ret*/) => {
        // ResetAllFileList(ret.filenames);
      })
      .catch(() => {
        alert('Failed to delete');
      })
      .finally(() => {
        $('#files').val('');
      });
  }, 100);
};

const jsonStrFormat = (jsonStr) => {
  return jsonStr
    .replace(/\\n/g, '\\n')
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, '\\&')
    .replace(/\\r/g, '\\r')
    .replace(/\\t/g, '\\t')
    .replace(/\\b/g, '\\b')
    .replace(/\\f/g, '\\f');
};

export const setFileListFromJson = (jsonText) => {
  const jsonFromIndexStr = jsonText; // @Html(Json.stringify(Json.toJson(jsonStrFromIndex)));
  const fomattedJsonFromIndexStr = jsonStrFormat(jsonFromIndexStr);
  const jsonFromIndex = JSON.parse(fomattedJsonFromIndexStr);

  if ('filenames' in jsonFromIndex) {
    ResetAllFileList(jsonFromIndex.filenames);
  }
};

export const ResetAllFileList = (filelist) => {
  //全て削除して再セット
  var parElm = document.getElementById('filelist');
  var list = parElm.getElementsByTagName('li');
  for (var i = list.length - 1; i >= 0; --i) {
    //末尾から順にすべて削除
    parElm.removeChild(list[i]);
  }

  for (const [filename, arrayBuffer] of filelist.entries()) {
    var item = document.createElement('li'); //li要素を作成

    var buttunElement = document.createElement('button');
    buttunElement.style.cssText = 'text-align : right';
    buttunElement.className = 'btn btn-default glyphicon glyphicon-trash';
    buttunElement.onclick = (function wrap(filename_) {
      return function() {
        deleteFile(filename_);
      };
    })(filename);

    item.appendChild(buttunElement);

    var whiteSpaceElement = document.createElement('span');
    whiteSpaceElement.innerHTML = '　';

    item.appendChild(whiteSpaceElement);

    var aTagElement = document.createElement('a');
    aTagElement.download = filename;
    aTagElement.target = '_blank';

    var blob = new Blob([arrayBuffer], { type: 'application/octet-binary' });

    if (window.navigator.msSaveBlob) {
      // for IE
      aTagElement.href = 'javascript:void(0)';
      aTagElement.onclick = (function wrap(_blob, name) {
        return function() {
          window.navigator.msSaveBlob(_blob, name);
        };
      })(blob, filename);
    } else if (window.URL && window.URL.createObjectURL) {
      // for Firefox
      aTagElement.href = window.URL.createObjectURL(blob);
      aTagElement.appendChild(document.createTextNode(filename));
    } else if (window.webkitURL && window.webkitURL.createObject) {
      // for Chrome
      aTagElement.href = window.URL.createObjectURL(blob);
      aTagElement.appendChild(document.createTextNode(filename));
    } else {
      // for Safari
      aTagElement.href = 'javascript:void(0)';
      aTagElement.onclick = (function wrap(arrayBuffer_) {
        return function() {
          window.open(
            'data:application/octet-binary;base64,' + window.Base64.encode(arrayBuffer_),
            '_blank',
          );
        };
      })(arrayBuffer);
    }

    item.appendChild(aTagElement);

    parElm.appendChild(item); //sample_container要素に追加
  }
  removeLoading();
};
