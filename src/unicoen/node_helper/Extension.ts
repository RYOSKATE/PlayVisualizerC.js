// インターフェイス統合によるコアクラスの拡張
declare interface Array<T> {
  equals(array:T[]): boolean;
  isEmpty():boolean;
  remove(obj:T):boolean;
}

// Warn if overriding existing method
if (Array.prototype.equals) {
  console.warn('Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there\'s a framework conflict or you\'ve got double inclusions in your code.');
}
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
  if (!array) {
    return false;
  }

    // compare lengths - can save a lot of time
  if (this.length !== array.length) {
    return false;
  }

  for (let i = 0, l = this.length; i < l; ++i) {
        // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
      if (!this[i].equals(array[i])) {
        return false;
      }
    } else if ('equals' in this[i] && 'equals' in array[i]) {
      return this[i].equals(array[i]);
    } else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

if (Array.prototype.isEmpty) {
  console.warn('Overriding existing Array.prototype.isEmpty. Possible causes: New API defines the method, there\'s a framework conflict or you\'ve got double inclusions in your code.');
}

Array.prototype.isEmpty = function () {
  return this.length === 0;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'isEmpty', { enumerable: false });

if (Array.prototype.remove) {
  console.warn('Overriding existing Array.prototype.remove. Possible causes: New API defines the method, there\'s a framework conflict or you\'ve got double inclusions in your code.');
}

Array.prototype.remove = function (obj) {
  const length = this.length;
  this.splice(this.indexOf(obj), 1);
  return this.length !== length;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'remove', { enumerable: false });

interface Map<K, V> {
  containsKey(key: K):boolean;
  containsValue(value: V):boolean;
}

if (Map.prototype.containsKey) {
  console.warn('Overriding existing Map.prototype.containsKey. Possible causes: New API defines the method, there\'s a framework conflict or you\'ve got double inclusions in your code.');
}

Map.prototype.containsKey = function (key) {
  return this.has(key);
};
// Hide method from for-in loops
Object.defineProperty(Map.prototype, 'containsKey', { enumerable: false });

if (Map.prototype.containsValue) {
  console.warn('Overriding existing Map.prototype.containsValue. Possible causes: New API defines the method, there\'s a framework conflict or you\'ve got double inclusions in your code.');
}

Map.prototype.containsValue = function (value) {
  for (const v of this.values()) {
    if (v === value) {
      return true;
    }
  }
  return false;
};
// Hide method from for-in loops
Object.defineProperty(Map.prototype, 'containsValue', { enumerable: false });
