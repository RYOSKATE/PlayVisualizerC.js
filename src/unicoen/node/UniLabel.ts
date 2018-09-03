import UniStatement from './UniStatement';

export default class UniLabel extends UniStatement {
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
    return 'Label(' + this.name + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniLabel)) return false;
    const that: UniLabel = <UniLabel>obj;
    return super.equals(that)
        && (this.name == null ? that.name == null : this.name === that.name);
  }

  public merge(that: UniLabel) {
    super.merge(that);
    if (that.name != null) {
      this.name = that.name;
    }
  }
}
