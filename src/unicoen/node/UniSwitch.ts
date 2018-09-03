import UniStatement from './UniStatement';
import UniExpr from './UniExpr';
import UniSwitchUnit from './UniSwitchUnit';

export default class UniSwitch extends UniStatement {
  public cond: UniExpr;
  public cases: UniSwitchUnit[];

  public constructor();
  public constructor(cond: UniExpr, cases: UniSwitchUnit[]);
  public constructor(cond?: UniExpr, cases?: UniSwitchUnit[]) {
    super();
    if (cond === undefined && cases === undefined) {
      this.cond = null;
      this.cases = [];
    } else if (cond === undefined || cases === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.cond = cond;
      this.cases = cases;
    }
    this.fields.set('cond', UniExpr);
    this.fields.set('cases', UniSwitchUnit);
  }

  public toString(): string {
    return 'Switch(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniSwitch)) return false;
    const that: UniSwitch = <UniSwitch>obj;
    return super.equals(that)
        && (this.cond == null ? that.cond == null : this.cond.equals(that.cond))
        && (this.cases == null ? that.cases == null : this.cases.equals(that.cases));
  }

  public merge(that: UniSwitch) {
    super.merge(that);
    if (that.cond != null) {
      this.cond = that.cond;
    }
    if (that.cases != null) {
      if (this.cases == null) {
        this.cases = that.cases;
      } else {
        this.cases.push(...that.cases);
      }
    }
  }
}
