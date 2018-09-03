import UniStatement from './UniStatement';
import UniExpr from './UniExpr';

export default class UniReturn extends UniStatement {
  public value: UniExpr;

  public constructor();
  public constructor(value: UniExpr);
  public constructor(value?: UniExpr) {
    super();
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
    this.fields.set('value', UniExpr);
  }

  public toString(): string {
    return 'Return(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniReturn)) return false;
    const that: UniReturn = <UniReturn>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value.equals(that.value));
  }

  public merge(that: UniReturn) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
