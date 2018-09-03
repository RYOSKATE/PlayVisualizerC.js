import UniExpr from './UniExpr';

export default class UniStringLiteral extends UniExpr {
  public value: string;

  public constructor();
  public constructor(value: string);
  public constructor(value?: string) {
    super();
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
    this.fields.set('value', String);
  }

  public toString(): string {
    return 'StringLiteral(' + this.value + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniStringLiteral)) return false;
    const that: UniStringLiteral = <UniStringLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value);
  }

  public merge(that: UniStringLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
