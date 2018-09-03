export var clone = (function() {
      function createMemo() {
          return {
              'Object': [],
              'Array' : [],
              'Function': [],
              'Error': [],
              'Date': [],
              'RegExp': [],
              'Boolean': [],
              'String': [],
              'Number': [],
          };
      }
      //循環参照対策のため、すべてオブジェクトをmemoに保存;
      var memo = createMemo();
      //main関数 第一引数はcloneしたいobject 第二引数はcloneしたくないobjectのconstructorを配列で指定する;
      function clone(object, prototypes) {
          //プリミティブ型はそのまま返す;
          if(object === null || (typeof object !== 'object' && typeof object !== 'function')) {
              return object;
          }
          //cloneしたくないobjectであれば、参照で返す;
          if(typeOf(prototypes) === 'Array'){
              for(var i = 0, len = prototypes.length; i < len; i++) {
                  if(Object.getPrototypeOf(object) === prototypes[i]) {
                      return object;
                  }
              }
          }
          //Nodeオブジェクトは自作関数cloneNodeに処理を任せる;
  //         if(object instanceof Node){
  //             return cloneNode(object);
  //         }
          //objectの型とcloneObjの型を同一にする;
          var cloneObj;
          var type = typeOf(object);
          switch(type) {
              case 'Object':
                  //自作クラスはprototype継承される
                  cloneObj = Object.create(Object.getPrototypeOf(object));
                  break;
              case 'Array':
                  cloneObj = [];
                  break;
              case 'Function':
                  //ネイティブ関数オブジェクトはcloneできないので、そのまま参照で返す;
                  try {
                      eval("cloneObj = " + object.toString());
                  }catch(e) {
                      return object;
                  }
                  break;
              case 'Error':
                  cloneObj = new Object.getPrototypeOf(object).constructor();
              case 'Date':
                  cloneObj = new Date(object.valueOf());
                  break;
              case 'RegExp':
                  cloneObj = new RegExp(object.valueOf());
                  break;
              case 'Boolean':
              case 'String':
              case 'Number':
                  cloneObj = new Object(object.valueOf());
                  break;
              default:
                  //ここで列挙されていない型は対応していないので、参照で返す;
                  return object;
          }
          //循環参照対策 objectが既にmemoに保存されていれば内部参照なので、値渡しではなくcloneObjに参照先を切り替えたobjectを返す;
          for(var i = 0, len = memo[type].length; i < len; i++) {
              if(memo[type][i][0] === object) {
                  return memo[type][i][1];
              }
          }
          //循環参照対策 objectはcloneObjとセットでmemoに追加;
          memo[type].push([object, cloneObj]);
   
          //objectのすべてのプロパティを再帰的にcloneする;
          var properties = Object.getOwnPropertyNames(object);
          for(var i = 0, len = properties.length; i < len; i++) {
              var prop = properties[i];
              cloneObj[prop] = clone(object[prop], prototypes);
          }
          //cloneしたオブジェクトを返す;
          return cloneObj;
      }
      function typeOf(operand) {
          return Object.prototype.toString.call(operand).slice(8, -1);
      }
      function cloneNode(node) {
          //script要素は再評価するためにcloneScriptでcloneする;
          if(node.tagName === 'SCRIPT') {
              return cloneScript(node);
          }
          //cloneNodeで要素をcloneする;
          var clone = node.cloneNode();
          //子要素があれば再帰的に追加;
          if(node.firstChild) {
              var childNodes = node.childNodes;
              for(var i = 0, len = childNodes.length; i < len; i++) {
                  clone.appendChild(cloneNode(childNodes[i]));
              }
          }
          return clone;
      }
      function cloneScript(element) {
          var script = document.createElement('script');
          var attrs = element.attributes;
          for(var i = 0, len = attrs.length; i < len; i++) {
              var attr = attrs[i];
              script.setAttribute(attr.name, attr.value);
          }
          script.innerHTML = element.innerHTML;
          return script;
      }
   
      return function(object, prototypes) {
          memo = createMemo();
          return clone(object, prototypes);
      }
  })();