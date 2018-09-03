import UniExpr from './UniExpr';

export default class UniTernaryOp extends UniExpr {
  public cond: UniExpr;
  public trueExpr: UniExpr;
  public falseExpr: UniExpr;

  public constructor();
  public constructor(cond: UniExpr, trueExpr: UniExpr, falseExpr: UniExpr);
  public constructor(cond?: UniExpr, trueExpr?: UniExpr, falseExpr?: UniExpr) {
    super();
    if (cond === undefined && trueExpr === undefined && falseExpr === undefined) {
      this.cond = null;
      this.trueExpr = null;
      this.falseExpr = null;
    } else if (cond === undefined || trueExpr === undefined || falseExpr === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.cond = cond;
      this.trueExpr = trueExpr;
      this.falseExpr = falseExpr;
    }
    this.fields.set('cond', UniExpr);
    this.fields.set('trueExpr', UniExpr);
    this.fields.set('falseExpr', UniExpr);
  }

  public toString(): string {
    return 'TernaryOp(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniTernaryOp)) return false;
    const that: UniTernaryOp = <UniTernaryOp>obj;
    return super.equals(that)
        && (this.cond == null ? that.cond == null : this.cond.equals(that.cond))
        && (this.trueExpr == null ? that.trueExpr == null : this.trueExpr.equals(that.trueExpr))
        && (this.falseExpr == null ? that.falseExpr == null : this.falseExpr.equals(that.falseExpr));
  }

  public merge(that: UniTernaryOp) {
    super.merge(that);
    if (that.cond != null) {
      this.cond = that.cond;
    }
    if (that.trueExpr != null) {
      this.trueExpr = that.trueExpr;
    }
    if (that.falseExpr != null) {
      this.falseExpr = that.falseExpr;
    }
  }
}
