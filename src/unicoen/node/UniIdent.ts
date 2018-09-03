import UniExpr from './UniExpr';

export default class UniIdent extends UniExpr {
  public name: string;

  public constructor();
  public constructor(name: string);
  public constructor(name?: string) {
    super();
    if (name === undefined) {
      this.name = null;
    } else {
      this.name = name;
    }
    this.fields.set('name', String);
  }

  public toString(): string {
    return 'Ident(' + this.name + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniIdent)) return false;
    const that: UniIdent = <UniIdent>obj;
    return super.equals(that)
        && (this.name == null ? that.name == null : this.name === that.name);
  }

  public merge(that: UniIdent) {
    super.merge(that);
    if (that.name != null) {
      this.name = that.name;
    }
  }
}
