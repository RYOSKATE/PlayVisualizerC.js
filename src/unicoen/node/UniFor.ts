import UniStatement from './UniStatement';
import UniExpr from './UniExpr';

export default class UniFor extends UniStatement {
  public init: UniExpr;
  public cond: UniExpr;
  public step: UniExpr;
  public statement: UniStatement;

  public constructor();
  public constructor(init: UniExpr, cond: UniExpr, step: UniExpr, statement: UniStatement);
  public constructor(init?: UniExpr, cond?: UniExpr, step?: UniExpr, statement?: UniStatement) {
    super();
    if (init === undefined && cond === undefined && step === undefined && statement === undefined) {
      this.init = null;
      this.cond = null;
      this.step = null;
      this.statement = null;
    } else if (init === undefined || cond === undefined || step === undefined || statement === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.init = init;
      this.cond = cond;
      this.step = step;
      this.statement = statement;
    }
    this.fields.set('init', UniExpr);
    this.fields.set('cond', UniExpr);
    this.fields.set('step', UniExpr);
    this.fields.set('statement', UniStatement);
  }

  public toString(): string {
    return 'For(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniFor)) return false;
    const that: UniFor = <UniFor>obj;
    return super.equals(that)
        && (this.init == null ? that.init == null : this.init.equals(that.init))
        && (this.cond == null ? that.cond == null : this.cond.equals(that.cond))
        && (this.step == null ? that.step == null : this.step.equals(that.step))
        && (this.statement == null ? that.statement == null : this.statement.equals(that.statement));
  }

  public merge(that: UniFor) {
    super.merge(that);
    if (that.init != null) {
      this.init = that.init;
    }
    if (that.cond != null) {
      this.cond = that.cond;
    }
    if (that.step != null) {
      this.step = that.step;
    }
    if (that.statement != null) {
      this.statement = that.statement;
    }
  }
}
