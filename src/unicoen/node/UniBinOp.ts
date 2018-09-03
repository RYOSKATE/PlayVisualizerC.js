import UniExpr from './UniExpr';

export default class UniBinOp extends UniExpr {
  public operator: string;
  public left: UniExpr;
  public right: UniExpr;

  public constructor();
  public constructor(operator: string, left: UniExpr, right: UniExpr);
  public constructor(operator?: string, left?: UniExpr, right?: UniExpr) {
    super();
    if (operator === undefined && left === undefined && right === undefined) {
      this.operator = null;
      this.left = null;
      this.right = null;
    } else if (operator === undefined || left === undefined || right === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.operator = operator;
      this.left = left;
      this.right = right;
    }
    this.fields.set('operator', String);
    this.fields.set('left', UniExpr);
    this.fields.set('right', UniExpr);
  }

  public toString(): string {
    return 'BinOp(' + this.operator + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniBinOp)) return false;
    const that: UniBinOp = <UniBinOp>obj;
    return super.equals(that)
        && (this.operator == null ? that.operator == null : this.operator === that.operator)
        && (this.left == null ? that.left == null : this.left.equals(that.left))
        && (this.right == null ? that.right == null : this.right.equals(that.right));
  }

  public merge(that: UniBinOp) {
    super.merge(that);
    if (that.operator != null) {
      this.operator = that.operator;
    }
    if (that.left != null) {
      this.left = that.left;
    }
    if (that.right != null) {
      this.right = that.right;
    }
  }
}
