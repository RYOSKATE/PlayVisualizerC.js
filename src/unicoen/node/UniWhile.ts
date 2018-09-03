import UniStatement from './UniStatement';
import UniExpr from './UniExpr';

export default class UniWhile extends UniStatement {
  public cond: UniExpr;
  public statement: UniStatement;

  public constructor();
  public constructor(cond: UniExpr, statement: UniStatement);
  public constructor(cond?: UniExpr, statement?: UniStatement) {
    super();
    if (cond === undefined && statement === undefined) {
      this.cond = null;
      this.statement = null;
    } else if (cond === undefined || statement === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.cond = cond;
      this.statement = statement;
    }
    this.fields.set('cond', UniExpr);
    this.fields.set('statement', UniStatement);
  }

  public toString(): string {
    return 'While(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniWhile)) return false;
    const that: UniWhile = <UniWhile>obj;
    return super.equals(that)
        && (this.cond == null ? that.cond == null : this.cond.equals(that.cond))
        && (this.statement == null ? that.statement == null : this.statement.equals(that.statement));
  }

  public merge(that: UniWhile) {
    super.merge(that);
    if (that.cond != null) {
      this.cond = that.cond;
    }
    if (that.statement != null) {
      this.statement = that.statement;
    }
  }
}
