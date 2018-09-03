import UniExpr from '../node/UniExpr';
import { assert } from 'chai';
import RuntimeException, { UniRuntimeError } from './RuntimeException';
import UniFunctionDec from '../node/UniFunctionDec';
import File from './File';


enum Type {  GLOBAL,  OBJECT,  LOCAL }

class Address {
  constructor(public codeAddress: number, public staticAddress: number, 
              public heapAddress: number, public stackAddress: number) {
  }
}

interface VariableNotFoundListener {
  variableNotFound(key : string, setDefault : Consumer<any>);
}

interface Consumer<T> {
  accept(t:T):void;
}
class ValueSetter implements Consumer<any> {
  public hasValue:boolean;
  public value:any;

  public accept(value:any):void {
    this.hasValue = true;
    this.value = value;
  }
}

export default class Scope {
  public name: string;
  public depth: number;
  public address: Address;
  public type:Type;
  public parent: Scope;
  public global: Scope;
  public children: Scope[] = [];
  public readonly variableAddress: Map<string, number> = new Map();
  public readonly variableTypes: Map<string, string> = new Map();
  public readonly functionAddress: Map<string, number>;
  public readonly mallocData: Map<number, number>;
  public readonly objectOnMemory: Map<number, any>;
  public readonly typeOnMemory: Map<number, string>;
  private listeners : VariableNotFoundListener[] = null;
  private tempAddressForListener:number = -1;

  private static assertNotUnicoen(value:any):void {
    if (value instanceof UniExpr && !(value instanceof UniFunctionDec)) {
      throw new RuntimeException('Maybe programming miss!');
    }
  }

  private constructor(type:Type , parent:Scope) {
    this.parent = parent;
    this.type = type;
    if (parent === null) {
      this.depth = 0;
      this.name = 'GLOBAL';
      this.global = this;
      this.address = new Address(0, 10000, 20000, 50000);
      this.mallocData = new Map();
      this.objectOnMemory = new Map();
      this.typeOnMemory = new Map();
      this.functionAddress = new Map();
    } else {
      parent.children.push(this);
      this.depth = parent.depth + 1;
      this.name = parent.name;
      this.global = parent.global;
      this.address = parent.address;
      this.address.stackAddress++;
      this.mallocData = parent.mallocData;
      this.objectOnMemory = parent.objectOnMemory;
      this.typeOnMemory = parent.typeOnMemory;
      this.functionAddress = parent.functionAddress;
    }
  }

  public setListener(listener:VariableNotFoundListener):void {
    if (this.listeners == null) {
      this.listeners = [];
    }
    this.listeners.push(listener);
  }

  public hasValue(key:string):boolean {
    try {
      this.getValue(this.getAddress(key));
      return true;
    } catch (err) {
      if (err instanceof UniRuntimeError) {
        return false;
      }
      throw err;
    }
  }

  public get(key:string):any {
    return this.getValue(this.getAddress(key));
  }
  
  public getValue(key:number):any {
    return this.getValueImple(key, this.name);
  }
  
  public getStr(name : string) : string {
    const addr : number = this.getAddress(name);
    const buf : number[] = [];
    let i : number = 0;
    for (; i < 10000; ++i) {
      const b : number = this.getValue(addr + i);
      if (b === 0) {
        break;
      }
      buf.push(b);
    }
    // tslint:disable-next-line:prefer-array-literal
    const array = new Array<number>(i);
    for (let k : number = 0; k < i; ++k) {
      array[k] = /* get */buf[k];
    }
    const result : string = String.fromCharCode.apply(null, array);
    return result;
  }

  private getValueImple(key : number, stackName : string) : any {
    if (this.objectOnMemory.has(key)) {
      const _var = this.objectOnMemory.get(key);
      if (stackName === this.name || this.type === Type.GLOBAL) {
        if (key === this.tempAddressForListener)
          this.objectOnMemory.delete(this.tempAddressForListener);
        return _var;
      }
    }
    if (this.parent != null) {
      return this.parent.getValue(key);
    } else {
      throw new UniRuntimeError(`variable ${key} is not defined.`);
    }
  }

  public getType(key:string|number):string {
    if (typeof key === 'string') {
      if (this.variableTypes.has(key)) {
        return this.variableTypes.get(key);
      } else if (this.parent != null) {
        return this.parent.getType(key);
      }
    }
    if (typeof key === 'number') {
      if (this.typeOnMemory.has(key)) {
        return this.typeOnMemory.get(key);
      } else if (this.parent != null) {
        return this.parent.getType(key);
      }
    }

    throw new UniRuntimeError(`variable ${key} is not defined.`);
  }

  public getAddress(key:string):number {
    if (this.variableAddress.has(key)) {
      return this.variableAddress.get(key);
    } else if (this.parent != null) {
      return this.parent.getAddress(key);
    } else if (this.listeners != null) {
      const setter = new ValueSetter();
      for (const listener of this.listeners) {
        listener.variableNotFound(key, setter);
        if (setter.hasValue) {
          this.objectOnMemory.set(this.tempAddressForListener, setter.value);
          return -1;
        }
      }
    }
    throw new UniRuntimeError(`variable ${key} is not defined.`);
  }

  public setMallocSize(address:number, size:number):void {
	  this.mallocData.set(address, size);
  }

  public isMallocArea(address:number):boolean {
    return this.mallocData.has(address);
  }

  public getMallocSize(address:number):number {
    return this.mallocData.get(address);
  }

  public removeOnMemory(address:number, size:number):boolean {
    let result = true;
    for (let i = 0; i < size; ++i) {
      result = (this.objectOnMemory.delete(address + i) != null);
      result = (this.typeOnMemory.delete(address + i) != null);
    }
    return result;
  }

  private setAreaImple(value:any, type:string, addr:Address, member:string):number {
    Scope.assertNotUnicoen(value);
    this.objectOnMemory.set(addr[member], value);
    this.typeOnMemory.set(addr[member], type);
    return addr[member]++;
  }
  
  
  public setHeap(value:any, type:string):number {
    return this.setAreaImple(value, type, this.address, 'heapAddress');
  }

  public setStatic(value:any, type:string):number {
    return this.setAreaImple(value, type, this.address,'staticAddress');
  }

  public setCode(value:any, type:string):number {
    return this.setAreaImple(value, type, this.address,'codeAddress');
  }

  public setSystemVariable(type:string, name:string, value:any):number {
    Scope.assertNotUnicoen(value);
    this.variableTypes.set(name, type);
    this.variableAddress.set(name, this.address.codeAddress);
    this.objectOnMemory.set(this.address.codeAddress, value);
    this.typeOnMemory.set(this.address.codeAddress, type);
    return this.address.codeAddress++;
  }
    
  /** 現在のスコープに新しい変数を定義し、代入します */
  public setTop(key:string, value:any, type:string):void {
    Scope.assertNotUnicoen(value);
    if (this.hasValue(type)) {// 構造体
      this.setPrimitive(key, this.address.stackAddress + 1, type);
      const offsets:Map<string, number> = this.get(type);
      let arr:any[] = null;
      if (value instanceof Array) {// 初期化リストあり
        arr = value;
        for (let i = arr.length; i < offsets.size; ++i) {
          arr.push(0);
        }
      } else if (typeof value === 'number') {// コピー
        arr = [];
        for (const valueofOffset of offsets.values()) {
          let addr:number = value;
          addr += valueofOffset;
          const v:any = this.getValue(addr);
          arr.push(v);
        }
      } else {// 宣言のみ
        arr = [];
        for (let i = 0; i < offsets.size; ++i) {
          arr.push(null);
        }
      }
      this.setArray(arr, type);
    } else if (value instanceof Array) {// 配列の場合
      const arr = value;
      if (type === 'char*') {// 文字列の場合(char*の場合, char[], char[10]の場合は↓)
        arr.push(0);
        this.setPrimitive(key, this.address.codeAddress, type);
        this.setStringOnCode(arr);
      } else {
        this.setPrimitiveOnCode(key, this.address.stackAddress, type + '[' + arr.length + ']');
        this.setArray(arr, type);
      }
    } else if (type === 'FUNCTION' || value instanceof UniFunctionDec) {
      this.setPrimitiveOnCode(key, value, type);
    } else {// 組み込み型の場合
      this.setPrimitive(key, value, type);
    }
  }
  
  private setArray(value:any[], type:string):void {
    Scope.assertNotUnicoen(value);
    for (const _var of value) {
      if (_var instanceof Array) {
        this.setArray(_var, type);
      } else {
        this.typeOnMemory.set(this.address.stackAddress, type);
        this.objectOnMemory.set(this.address.stackAddress++, _var);
      }
    }
  }

  private setStringOnCode(value:any[]):void {
    Scope.assertNotUnicoen(value);
    for (const _var of value) {
      if (_var instanceof Array) {
        this.setStringOnCode(_var);
      } else {
        this.typeOnMemory.set(this.address.codeAddress, 'char');
        this.objectOnMemory.set(this.address.codeAddress++, _var);
      }
    }
  }

  private setImple(key:string, value:any, type:string, address:Address, member:string):void {
    Scope.assertNotUnicoen(value);
    this.variableTypes.set(key, type);
    this.variableAddress.set(key, address[member]);
    this.objectOnMemory.set(address[member], value);
    this.typeOnMemory.set(address[member], type);
    ++address[member];
  }

  private setPrimitive(key:string, value:any, type:string):void {
    this.setImple(key, value, type, this.address, 'stackAddress');
  }

  private setPrimitiveOnCode(key:string, value:any, type:string):void {
    this.setImple(key, value, type, this.address, 'codeAddress');
  }

  private setPrimitiveOnHeap(key:string, value:any, type:string):void {
    this.setImple(key, value, type, this.address, 'heapAddress');
  }

  private setPrimitiveOnStatic(key:string, value:any, type:string):void {
    this.setImple(key, value, type, this.address, 'staticAddress');
  }

  	/** 指定したメモリアドレスに値を書き込みます */
  public set(addr:number, value:any):void {
    Scope.assertNotUnicoen(value);
    if (this.objectOnMemory.has(addr)) {
      try {
        const type:string = this.getType(addr);
        const offsets:Map<string, number>  = this.get(type);
        for (const valueOfOffset of offsets.values()) {
          const dst = <number>this.getValue(addr) + valueOfOffset;
          const src = <number>value + valueOfOffset;
          const v = this.getValue(src);
          this.objectOnMemory.set(dst, v);
        }
      } catch (e) {
        if (e instanceof UniRuntimeError) {
          this.objectOnMemory.set(addr, value);
        } else {
          throw e;
        }
      }
      return;
    }
    if (this.parent != null) {
      this.parent.set(addr, value);
      return;
    }
    throw new UniRuntimeError(`address ${addr} is not declared.`);
  }

  public static createGlobal():Scope {
    return new Scope(Type.GLOBAL, null);
  }

  public static createObject(global:Scope):Scope {
    assert.ok(global != null);
    assert.ok(global.type === Type.GLOBAL); // 匿名クラスは未対応
    return new Scope(Type.OBJECT, global);
  }

  public static createLocal(parent:Scope):Scope {
    assert.ok(parent != null);
    return new Scope(Type.LOCAL, parent);
  }

  public removeChild(scope:Scope):boolean {
    return this.children.remove(scope);
  }

  private hasName(funcName:string):boolean {
    if (this.name === funcName) {
      return true;
    } else if (this.parent != null) {
      return this.parent.hasName(funcName);
    }
    return false;
  }

  public getNextName(funcName:string):string {
    if (!this.hasName(funcName))
      return funcName;
    for (let i = 2; ; ++i) {
      const indexName:string = funcName + '.' + i;
      if (!this.hasName(indexName)) {
        return indexName;
      }
    }
  }

  public closeAllFiles() {
    for (const value of this.objectOnMemory.values()) {
      if (value instanceof File) {
        value.fclose();
      }
    }
  }
}
