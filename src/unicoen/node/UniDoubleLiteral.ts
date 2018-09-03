import UniNumberLiteral from './UniNumberLiteral';

export default class UniDoubleLiteral extends UniNumberLiteral {
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
    return 'DoubleLiteral(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniDoubleLiteral)) return false;
    const that: UniDoubleLiteral = <UniDoubleLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value);
  }

  public merge(that: UniDoubleLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
