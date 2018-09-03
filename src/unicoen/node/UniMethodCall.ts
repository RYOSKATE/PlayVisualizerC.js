import UniExpr from './UniExpr';
import UniIdent from './UniIdent';

export default class UniMethodCall extends UniExpr {
  public receiver: UniExpr;
  public methodName: UniIdent;
  public args: UniExpr[];

  public constructor();
  public constructor(receiver: UniExpr, methodName: UniIdent, args: UniExpr[]);
  public constructor(receiver?: UniExpr, methodName?: UniIdent, args?: UniExpr[]) {
    super();
    if (receiver === undefined && methodName === undefined && args === undefined) {
      this.receiver = null;
      this.methodName = null;
      this.args = [];
    } else if (receiver === undefined || methodName === undefined || args === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.receiver = receiver;
      this.methodName = methodName;
      this.args = args;
    }
    this.fields.set('receiver', UniExpr);
    this.fields.set('methodName', UniIdent);
    this.fields.set('args', UniExpr);
  }

  public toString(): string {
    return 'MethodCall(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniMethodCall)) return false;
    const that: UniMethodCall = <UniMethodCall>obj;
    return super.equals(that)
        && (this.receiver == null ? that.receiver == null : this.receiver.equals(that.receiver))
        && (this.methodName == null ? that.methodName == null : this.methodName.equals(that.methodName))
        && (this.args == null ? that.args == null : this.args.equals(that.args));
  }

  public merge(that: UniMethodCall) {
    super.merge(that);
    if (that.receiver != null) {
      this.receiver = that.receiver;
    }
    if (that.methodName != null) {
      this.methodName = that.methodName;
    }
    if (that.args != null) {
      if (this.args == null) {
        this.args = that.args;
      } else {
        this.args.push(...that.args);
      }
    }
  }
}
