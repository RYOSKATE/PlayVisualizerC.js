import UniDecralation from './UniDecralation';
import UniExpr from './UniExpr';

export default class UniVariableDef extends UniDecralation {
  public name: string;
  public value: UniExpr;
  public typeSuffix: string;

  public constructor();
  public constructor(name: string, value: UniExpr, typeSuffix: string);
  public constructor(name?: string, value?: UniExpr, typeSuffix?: string) {
    super();
    if (name === undefined && value === undefined && typeSuffix === undefined) {
      this.name = null;
      this.value = null;
      this.typeSuffix = null;
    } else if (name === undefined || value === undefined || typeSuffix === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.name = name;
      this.value = value;
      this.typeSuffix = typeSuffix;
    }
    this.fields.set('name', String);
    this.fields.set('value', UniExpr);
    this.fields.set('typeSuffix', String);
  }

  public toString(): string {
    return 'VariableDef(' + this.name + ', ' + this.typeSuffix + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniVariableDef)) return false;
    const that: UniVariableDef = <UniVariableDef>obj;
    return super.equals(that)
        && (this.name == null ? that.name == null : this.name === that.name)
        && (this.value == null ? that.value == null : this.value.equals(that.value))
        && (this.typeSuffix == null ? that.typeSuffix == null : this.typeSuffix === that.typeSuffix);
  }

  public merge(that: UniVariableDef) {
    super.merge(that);
    if (that.name != null) {
      this.name = that.name;
    }
    if (that.value != null) {
      this.value = that.value;
    }
    if (that.typeSuffix != null) {
      this.typeSuffix = that.typeSuffix;
    }
  }
}
