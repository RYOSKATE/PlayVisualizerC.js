import UniExpr from './UniExpr';

export default class UniNumberLiteral extends UniExpr {
  public value: any;
  public signed: boolean;
  public bytes: number;
  public isFloat: boolean;
  public type: string;
  public prefix: string;
  public sufix: string;

  public constructor();
  public constructor(value: any, signed: boolean, bytes: number, isFloat: boolean, type: string, prefix: string, sufix: string);
  public constructor(value?: any, signed?: boolean, bytes?: number, isFloat?: boolean, type?: string, prefix?: string, sufix?: string) {
    super();
    if (value === undefined && signed === undefined && bytes === undefined && isFloat === undefined && type === undefined && prefix === undefined && sufix === undefined) {
      this.value = null;
      this.signed = null;
      this.bytes = null;
      this.isFloat = null;
      this.type = null;
      this.prefix = null;
      this.sufix = null;
    } else if (value === undefined || signed === undefined || bytes === undefined || isFloat === undefined || type === undefined || prefix === undefined || sufix === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.value = value;
      this.signed = signed;
      this.bytes = bytes;
      this.isFloat = isFloat;
      this.type = type;
      this.prefix = prefix;
      this.sufix = sufix;
    }
    this.fields.set('value', Object);
    this.fields.set('signed', Boolean);
    this.fields.set('bytes', Number);
    this.fields.set('isFloat', Boolean);
    this.fields.set('type', String);
    this.fields.set('prefix', String);
    this.fields.set('sufix', String);
  }

  public toString(): string {
    return 'NumberLiteral(' + this.type + ', ' + this.prefix + ', ' + this.sufix + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniNumberLiteral)) return false;
    const that: UniNumberLiteral = <UniNumberLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value)
        && (this.signed == null ? that.signed == null : this.signed === that.signed)
        && (this.bytes == null ? that.bytes == null : this.bytes === that.bytes)
        && (this.isFloat == null ? that.isFloat == null : this.isFloat === that.isFloat)
        && (this.type == null ? that.type == null : this.type === that.type)
        && (this.prefix == null ? that.prefix == null : this.prefix === that.prefix)
        && (this.sufix == null ? that.sufix == null : this.sufix === that.sufix);
  }

  public merge(that: UniNumberLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
    if (that.signed != null) {
      this.signed = that.signed;
    }
    if (that.bytes != null) {
      this.bytes = that.bytes;
    }
    if (that.isFloat != null) {
      this.isFloat = that.isFloat;
    }
    if (that.type != null) {
      this.type = that.type;
    }
    if (that.prefix != null) {
      this.prefix = that.prefix;
    }
    if (that.sufix != null) {
      this.sufix = that.sufix;
    }
  }
}
