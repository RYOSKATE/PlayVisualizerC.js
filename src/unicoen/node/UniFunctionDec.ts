import UniDecralation from './UniDecralation';
import UniParam from './UniParam';
import UniBlock from './UniBlock';

export default class UniFunctionDec extends UniDecralation {
  public name: string;
  public modifiers: string[];
  public returnType: string;
  public params: UniParam[];
  public block: UniBlock;

  public constructor();
  public constructor(name: string, modifiers: string[], returnType: string, params: UniParam[], block: UniBlock);
  public constructor(name?: string, modifiers?: string[], returnType?: string, params?: UniParam[], block?: UniBlock) {
    super();
    if (name === undefined && modifiers === undefined && returnType === undefined && params === undefined && block === undefined) {
      this.name = null;
      this.modifiers = [];
      this.returnType = null;
      this.params = [];
      this.block = null;
    } else if (name === undefined || modifiers === undefined || returnType === undefined || params === undefined || block === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.name = name;
      this.modifiers = modifiers;
      this.returnType = returnType;
      this.params = params;
      this.block = block;
    }
    this.fields.set('name', String);
    this.fields.set('modifiers', String);
    this.fields.set('returnType', String);
    this.fields.set('params', UniParam);
    this.fields.set('block', UniBlock);
  }

  public toString(): string {
    return 'FunctionDec(' + this.name + ', ' + this.returnType + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniFunctionDec)) return false;
    const that: UniFunctionDec = <UniFunctionDec>obj;
    return super.equals(that)
        && (this.name == null ? that.name == null : this.name === that.name)
        && (this.modifiers == null ? that.modifiers == null : this.modifiers.equals(that.modifiers))
        && (this.returnType == null ? that.returnType == null : this.returnType === that.returnType)
        && (this.params == null ? that.params == null : this.params.equals(that.params))
        && (this.block == null ? that.block == null : this.block.equals(that.block));
  }

  public merge(that: UniFunctionDec) {
    super.merge(that);
    if (that.name != null) {
      this.name = that.name;
    }
    if (that.modifiers != null) {
      if (this.modifiers == null) {
        this.modifiers = that.modifiers;
      } else {
        this.modifiers.push(...that.modifiers);
      }
    }
    if (that.returnType != null) {
      this.returnType = that.returnType;
    }
    if (that.params != null) {
      if (this.params == null) {
        this.params = that.params;
      } else {
        this.params.push(...that.params);
      }
    }
    if (that.block != null) {
      this.block = that.block;
    }
  }
}
