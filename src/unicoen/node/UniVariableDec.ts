import UniDecralation from './UniDecralation';
import UniVariableDef from './UniVariableDef';

export default class UniVariableDec extends UniDecralation {
  public modifiers: string[];
  public type: string;
  public variables: UniVariableDef[];

  public constructor();
  public constructor(modifiers: string[], type: string, variables: UniVariableDef[]);
  public constructor(modifiers?: string[], type?: string, variables?: UniVariableDef[]) {
    super();
    if (modifiers === undefined && type === undefined && variables === undefined) {
      this.modifiers = [];
      this.type = null;
      this.variables = [];
    } else if (modifiers === undefined || type === undefined || variables === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.modifiers = modifiers;
      this.type = type;
      this.variables = variables;
    }
    this.fields.set('modifiers', String);
    this.fields.set('type', String);
    this.fields.set('variables', UniVariableDef);
  }

  public toString(): string {
    return 'VariableDec(' + this.type + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniVariableDec)) return false;
    const that: UniVariableDec = <UniVariableDec>obj;
    return super.equals(that)
        && (this.modifiers == null ? that.modifiers == null : this.modifiers.equals(that.modifiers))
        && (this.type == null ? that.type == null : this.type === that.type)
        && (this.variables == null ? that.variables == null : this.variables.equals(that.variables));
  }

  public merge(that: UniVariableDec) {
    super.merge(that);
    if (that.modifiers != null) {
      if (this.modifiers == null) {
        this.modifiers = that.modifiers;
      } else {
        this.modifiers.push(...that.modifiers);
      }
    }
    if (that.type != null) {
      this.type = that.type;
    }
    if (that.variables != null) {
      if (this.variables == null) {
        this.variables = that.variables;
      } else {
        this.variables.push(...that.variables);
      }
    }
  }
}
