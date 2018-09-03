import UniExpr from './UniExpr';

export default class UniArray extends UniExpr {
  public items: UniExpr[];

  public constructor();
  public constructor(items: UniExpr[]);
  public constructor(items?: UniExpr[]) {
    super();
    if (items === undefined) {
      this.items = [];
    } else {
      this.items = items;
    }
    this.fields.set('items', UniExpr);
  }

  public toString(): string {
    return 'Array(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniArray)) return false;
    const that: UniArray = <UniArray>obj;
    return super.equals(that)
        && (this.items == null ? that.items == null : this.items.equals(that.items));
  }

  public merge(that: UniArray) {
    super.merge(that);
    if (that.items != null) {
      if (this.items == null) {
        this.items = that.items;
      } else {
        this.items.push(...that.items);
      }
    }
  }
}
