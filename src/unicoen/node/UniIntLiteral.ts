import UniNumberLiteral from './UniNumberLiteral';

export default class UniIntLiteral extends UniNumberLiteral {
  public value: number;

  public constructor();
  public constructor(value: number);
  public constructor(value?: number) {
    super();
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
    this.fields.set('value', Number);
  }

  public toString(): string {
    return 'IntLiteral(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniIntLiteral)) return false;
    const that: UniIntLiteral = <UniIntLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value);
  }

  public merge(that: UniIntLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
