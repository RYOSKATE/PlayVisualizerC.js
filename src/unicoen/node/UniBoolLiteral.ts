import UniExpr from './UniExpr';

export default class UniBoolLiteral extends UniExpr {
  public value: boolean;

  public constructor();
  public constructor(value: boolean);
  public constructor(value?: boolean) {
    super();
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
    this.fields.set('value', Boolean);
  }

  public toString(): string {
    return 'BoolLiteral(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniBoolLiteral)) return false;
    const that: UniBoolLiteral = <UniBoolLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value);
  }

  public merge(that: UniBoolLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
