import UniExpr from './UniExpr';

export default class UniUnaryOp extends UniExpr {
  public operator: string;
  public expr: UniExpr;

  public constructor();
  public constructor(operator: string, expr: UniExpr);
  public constructor(operator?: string, expr?: UniExpr) {
    super();
    if (operator === undefined && expr === undefined) {
      this.operator = null;
      this.expr = null;
    } else if (operator === undefined || expr === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.operator = operator;
      this.expr = expr;
    }
    this.fields.set('operator', String);
    this.fields.set('expr', UniExpr);
  }

  public toString(): string {
    return 'UnaryOp(' + this.operator + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniUnaryOp)) return false;
    const that: UniUnaryOp = <UniUnaryOp>obj;
    return super.equals(that)
        && (this.operator == null ? that.operator == null : this.operator === that.operator)
        && (this.expr == null ? that.expr == null : this.expr.equals(that.expr));
  }

  public merge(that: UniUnaryOp) {
    super.merge(that);
    if (that.operator != null) {
      this.operator = that.operator;
    }
    if (that.expr != null) {
      this.expr = that.expr;
    }
  }
}
