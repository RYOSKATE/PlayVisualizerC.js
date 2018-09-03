import UniNumberLiteral from './UniNumberLiteral';

export default class UniCharLiteral extends UniNumberLiteral {
  public value: string;

  public constructor();
  public constructor(value: string);
  public constructor(value?: string) {
    super();
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
    this.fields.set('value', String);
  }

  public toString(): string {
    return 'CharLiteral(' + this.value + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniCharLiteral)) return false;
    const that: UniCharLiteral = <UniCharLiteral>obj;
    return super.equals(that)
        && (this.value == null ? that.value == null : this.value === that.value);
  }

  public merge(that: UniCharLiteral) {
    super.merge(that);
    if (that.value != null) {
      this.value = that.value;
    }
  }
}
