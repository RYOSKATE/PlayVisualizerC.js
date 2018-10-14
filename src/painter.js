export class CanvarDrawer {
  constructor() {
    this.reset();
  }

  reset() {
    CanvarDrawer.clearMemoryState();
    this.selectColorIndex = 0;
  }

  static clearMemoryState() {
    $('canvas').removeLayers();
    $('canvas').clearCanvas();
  }

  drawMemoryState(data) {
    //一度全て削除する
    this.reset();

    $.jCanvas.defaults.fromCenter = false; //座標を図形の中央ではなく左上に
    $.jCanvas.defaults.layer = true; //図形のレイヤー処理を有効化(グループ処理)
    $('canvas')
    .setLayer('mainLayer', {
      visible: false, //高速化・ちらつき防止のため最終的な状態になるまで描画しない
    })
    .drawLayers();

    const origin = new Victor(50, 50); //図形描画の基準位置
    let nextPos = origin.clone(); //次のRectの左上の位置

    const stacks = data.stacks;
    const global = data.global;
    for (const stack of stacks) {
      const stackDrawer = new StackDrawer(stack, global, nextPos);
      nextPos = stackDrawer.drawStack();
    }

    //アドレスから矢印描画
    const arrowDrawer = new ArrowDrawer(stacks, global, 1.0);
    arrowDrawer.drawAllPtrArrow(stacks);
    $.jCanvas.defaults.drag = arrowDrawer.onDrag; // Dragされた
    $('canvas')
      .getLayers()
      .reverse(); //スタックのRectが最前面になり内側に対するマウスイベントを全て全て受け取ってしまう。

    $('canvas').setLayer('mainLayer', {
      visible: true, //ここまでの処理が終わって初めて描画する
    })
    .drawLayers();
      
    return data;
  }

  rescale(scale) {
    $('canvas')
    .scaleCanvas({
      name: "scaleLayer",
      layer: true,
      scale
    }).drawLayers({
      complete: function () {
        $('canvas').restoreCanvas({name: "restore1",layer: true});
      }
    })
    .restoreCanvas({name: "restore2",layer: true});
  }
}

class StackDrawer {
  constructor(stack, global, nextPos) {
    this.nextPos = nextPos;
    this.pos = nextPos.clone(); //次の変数の左上の位置
    this.stack = stack;
    this.global = global;
    this.memoryName = stack.name; //nameはその関数名など
    this.heightOffset = 25;
    this.borderHeight = 25;
    this.maxWidths = [0, 0, 0, 0]; //型名、変数名、値、&変数名(メモリアドレス)の順番、配列の場合は1列目空欄で4列目を追加。(2次元なら3,4,5列)
    this.numOfRow = 0;
  }

  drawStack() {
    const variables = this.stack.variables; //変数一覧
    if (variables.length <= 0) {
      return this.nextPos;
    }
    //そのスタック内の変数を全て描画
    drawText(this.memoryName, this.pos.x, this.pos.y, this.memoryName, this.memoryName);
    this.makeVariables(variables, 0);
    //各列の最大幅に合わせてx座標修正
    const memoryTextLayer = $('#display').getLayer(this.memoryName + '-text');
    const borderWidth = Math.max(memoryTextLayer.width, this.maxWidths.reduce((x, y) => x + y));
    memoryTextLayer.x = memoryTextLayer.x + borderWidth / 2 - memoryTextLayer.width / 2;
    const reDrawVariable = (variables, col) => {
      for (const v of variables) {
        //ユニークな名前: スタック名+変数名+列名+テキスト
        const uniqueName = [this.memoryName, v.getName()].join('-');
        const leftPosX = $('#display').getLayer(`${uniqueName}-type-text`).x;
        const colName = ['name', 'value', 'address'];
        for (let i = 0, posX = leftPosX; i < colName.length; ++i) {
          posX += this.maxWidths[col + i];
          $('#display').getLayer([uniqueName, colName[i], 'text'].join('-')).x = posX;
        }
        if (v.value instanceof Array) {
          reDrawVariable(v.value, col + 1);
        }
      }
    };
    reDrawVariable(variables, 0);
    //console.log(this.maxWidths);
    //スタックを囲む四角形を描画
    const posTopLeft = this.nextPos.clone().add(new Victor(-5, -5));
    drawRect(posTopLeft, borderWidth, this.borderHeight, this.memoryName);

    //列単位で縦線を描画
    const memoryRectLayer = $('#display').getLayer(this.memoryName + '-rect');
    const start = new Victor(memoryRectLayer.x + 5, memoryRectLayer.y + this.heightOffset);
    const end = start.clone().addY(new Victor(0, memoryRectLayer.height - this.heightOffset));
    for (let i = 0; i < this.maxWidths.length - 1; ++i) {
      drawLine(
        start.addX(new Victor(this.maxWidths[i], 0)),
        end.addX(new Victor(this.maxWidths[i], 0)),
        `${this.memoryName}_${i}-colline`,
        this.memoryName,
      );
    }
    //変数単位で横線を描画
    const lineLeft = posTopLeft.clone();
    const lineRight = lineLeft.clone().addX(new Victor(borderWidth + 10, 0));
    for (let i = 0; i < this.numOfRow; ++i) {
      const start = lineLeft.addY(new Victor(0, this.heightOffset));
      const end = lineRight.addY(new Victor(0, this.heightOffset));
      const name = `${this.memoryName}_${i}-rowline`;
      const groupname = this.memoryName;
      drawLine(start, end, name, groupname);
    }
    this.nextPos = this.pos.add(new Victor(50, this.heightOffset + 10)).clone();
    return this.nextPos;
  }

  makeVariables(variables, col) {
    for (const v of variables) {
      this.pos.addY(new Victor(0, this.heightOffset));
      let posX = this.pos.x;

      const absName = v.getName();
      const uniqueName = this.memoryName + '-' + absName; //ユニークな名前: スタック名+変数名+列名+テキスト
      drawVariable(v.type, posX, this.pos.y, `${uniqueName}-type`, this.memoryName);
      const typeWidth = $('#display').getLayer(`${uniqueName}-type-text`).width;
      posX += typeWidth;

      drawVariable(v.name, this.pos.x, this.pos.y, `${uniqueName}-name`, this.memoryName);
      const nameWidth = $('#display').getLayer(`${uniqueName}-name-text`).width;
      posX += nameWidth;

      let value = v.value;
      let address = '0x' + v.address.toString(16);
      if (v.value instanceof Array && 0 <= v.value.length) {
        value = '0x' + v.value[0].address.toString(16);
        address = 'SYSTEM';
      }
      const rawType = this.global.getTypedef(v.type);
      if (~v.type.indexOf('*') && v.value != null) {
        value = '0x' + value.toString(16);
      }
      if (rawType === 'char' && value != null) {
        value += ` '${String.fromCharCode(value)}'`;
      }

      drawVariable(value, posX, this.pos.y, `${uniqueName}-value`, this.memoryName);
      const valueWidth = Math.max($('#display').getLayer(`${uniqueName}-value-text`).width, 80);
      posX += valueWidth;

      drawVariable(
        '&' + `${v.getName()}(${address})`,
        posX,
        this.pos.y,
        `${uniqueName}-address`,
        this.memoryName,
      );
      const addressWidth = $('#display').getLayer(`${uniqueName}-address-text`).width;

      //列を揃えるために最大幅を計算
      this.maxWidths[col] = Math.max(this.maxWidths[col], typeWidth);
      this.maxWidths[col + 1] = Math.max(this.maxWidths[col + 1], nameWidth);
      this.maxWidths[col + 2] = Math.max(this.maxWidths[col + 2], valueWidth);
      if (col + 3 < this.maxWidths.length)
        this.maxWidths[col + 3] = Math.max(this.maxWidths[col + 3], addressWidth);
      else this.maxWidths[col + 3] = addressWidth;

      this.borderHeight += this.heightOffset;

      if (v.value instanceof Array) {
        this.pos.addX(new Victor(this.maxWidths[col], 0));
        this.makeVariables(v.value, col + 1);
        this.pos.addX(new Victor(-this.maxWidths[col], 0));
      }
      ++this.numOfRow;
    }
  }
}

const drawLine = (start, end, name, groupname) => {
  $('#display').drawLine({
    strokeStyle: '#000',
    strokeWidth: 1,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
    name: name,
    groups: [groupname],
    dragGroups: [groupname],
  });
};

const drawRect = (posTopLeft, borderWidth, borderHeight, memoryName) => {
  $('#display').drawRect({
    strokeStyle: 'black',
    strokeWidth: 1,
    x: posTopLeft.x,
    y: posTopLeft.y,
    width: borderWidth + 10,
    height: borderHeight,
    draggable: true,
    name: memoryName + '-rect',
    groups: [memoryName],
    dragGroups: [
      memoryName,
    ] /*,
        click: function (layer) {
            // Click a star to spin it
            $(this).animateLayer(layer, {
                rotate: '+=360'
            })
        }*/,
  });
};

const drawText = (text, x, y, name, groupname) => {
  $('#display').drawText({
    fillStyle: 'black',
    strokeStyle: 'black',
    strokeWidth: '0.5',
    x: x,
    y: y,
    fontSize: 14,
    fontFamily: 'sans-serif',
    text: ' ' + text + ' ',
    name: name + '-text', //スタック名-変数名-列名-text
    draggable: true,
    groups: [groupname], //スタック名,変数名
    dragGroups: [groupname], //スタック名,変数名
  });
};

const drawVariable = (t, x, y, name, groupname) => {
  $('#display').drawText({
    fillStyle: 'black',
    strokeStyle: 'black',
    strokeWidth: '0.5',
    x: x,
    y: y,
    fontSize: 14,
    fontFamily: 'sans-serif',
    text: `   ${t}   `,
    name: `${name}-text`, //スタック名-変数名-列名-text
    draggable: true,
    groups: [groupname], //スタック名,変数名
    dragGroups: [groupname], //スタック名,変数名
  });
};

class Arrow {
  constructor(stack, val, valueOrAddrss) {
    this.layerName = [stack.name, val.getName(), valueOrAddrss, 'text'].join('-');
    this.value = $('#display').getLayer(this.layerName);
    this.x = $('#display').getLayer(`${stack.name}-rect`).x;
    this.y = this.value.y + this.value.height / 2;
    this.pos = new Victor(this.x, this.y);
  }
}

class ArrowDrawer {
  constructor(stacks, global, scale) {
    this.stacks = stacks;
    this.global = global;
    this.colorHashMap = {};
    this.arrowColorSet = new ArrowColorSet();
    this.scale = scale;

    this.onDrag = () => {
      const layers = $('canvas').getLayers();
      const toRemoveLayers = layers.filter((layer) => ~layer.name.indexOf('-arrow'));
      $.each(toRemoveLayers, (index, layer) => $('#display').removeLayer(layer.name));
      this.drawAllPtrArrow(this.stacks);
    };
  }
  drawArrow(name, start, mid, end, fromGroup, toGroup) {
    $('#display').drawQuadratic({
      strokeStyle: 'rgba(0, 0, 0, 0.5)',
      //fillStyle : 'rgba(0, 0, 0, 0.7)',
      strokeWidth: 3,
      rounded: true,
      endArrow: true,
      arrowRadius: 15,
      arrowAngle: 60,
      x1: start.x,
      y1: start.y,
      cx1: mid.x,
      cy1: mid.y,
      x2: end.x,
      y2: end.y,
      name: `${name}-arrow`,
      drag: this.onDrag, // Dragされた
      groups: [fromGroup, toGroup],
      dragGroups: [fromGroup, toGroup],
    });
  }

  drawAllPtrArrow() {
    for (const stack of this.stacks) {
      this.drawPtrArrow(stack, stack.variables);
    }
  }

  drawPtrArrow(baseStack, baseVariables) {
    for (const baseVariable of baseVariables) {
      const rawType = this.global.getTypedef(baseVariable.type);
      const isTypePtr = rawType.indexOf('*') != -1;
      if (isTypePtr || baseVariable.value instanceof Array) {
        const fromArrow = new Arrow(baseStack, baseVariable, 'value');

        for (const targetStack of this.stacks) {
          const targetVariables = targetStack.variables;
          this.drawPtrArrow2(baseStack, targetStack, baseVariable, targetVariables, fromArrow);
        }
      }
      if (baseVariable.value instanceof Array) {
        this.drawPtrArrow(baseStack, baseVariable.value);
      }
    }
  }

  drawPtrArrow2(baseStack, targetStack, baseVariable, targetVariables, fromArrow) {
    for (const targetVariable of targetVariables) {
      console.log(`${targetVariable.name}, ${baseVariable.name}`);
      const isArrayNamePtr =
        baseVariable.value instanceof Array && targetVariable.name == `${baseVariable.name}[0]`;
      if (isArrayNamePtr || targetVariable.address == baseVariable.value) {
        const toArrow = new Arrow(targetStack, targetVariable, 'address');

        const mid = this.calcMidPos(fromArrow, toArrow);

        const name = [
          baseStack.name,
          baseVariable.getName(),
          'to',
          targetStack.name,
          targetVariable.getName(),
        ].join('-');
        this.drawArrow(name, fromArrow.pos, mid, toArrow.pos, baseStack.name, targetStack.name); //もう一つ必要
        if (!(name in this.colorHashMap)) {
          this.colorHashMap[name] = this.arrowColorSet.get();
        }
        const color = this.colorHashMap[name];
        fromArrow.value.strokeStyle = color;
        $('#display').getLayer(`${name}-arrow`).strokeStyle = color;
        toArrow.value.strokeStyle = color;
      } else if (targetVariable.value instanceof Array) {
        this.drawPtrArrow2(baseStack, targetStack, baseVariable, targetVariable.value, fromArrow);
      }
    }
  }

  calcMidPos(fromArrow, toArrow) {
    console.log(`${fromArrow}, ${toArrow}`);
    const mid = new Victor(
      (fromArrow.pos.x + toArrow.pos.x) / 2,
      (fromArrow.pos.y + toArrow.pos.y) / 2,
    );
    const dir = toArrow.pos.clone().subtract(fromArrow.pos.clone());
    const length = dir.length();

    dir.normalize();
    if (fromArrow.pos.y < toArrow.pos.y) dir.rotateDeg(90);
    else dir.rotateDeg(-90);

    mid.add(dir.multiply(new Victor(length / 4, length / 4)));
    return mid;
  }
}

class ArrowColorSet {
  constructor() {
    this.selectColorIndex = 0;
  }
  get() {
    const array = [
      'rgba(255, 40, 0, 0.5)',
      //'rgba(250, 245, 0, 0.5)',
      'rgba(53, 161, 107, 0.5)',
      'rgba(0, 65, 255, 0.5)',
      'rgba(102, 204, 255, 0.7)',
      'rgba(255, 153, 160, 0.5)',
      'rgba(255, 153, 0, 0.5)',
      'rgba(154, 0, 121, 0.5)',
      'rgba(102, 51, 0, 0.5)',
    ];
    const select = array[this.selectColorIndex++];

    if (array.length <= this.selectColorIndex) this.selectColorIndex = 0;
    return select;
  }
}
