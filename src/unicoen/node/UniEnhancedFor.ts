import UniStatement from './UniStatement';
import UniExpr from './UniExpr';

export default class UniEnhancedFor extends UniStatement {
  public modifiers: string[];
  public type: string;
  public name: string;
  public container: UniExpr;
  public statement: UniStatement;

  public constructor();
  public constructor(modifiers: string[], type: string, name: string, container: UniExpr, statement: UniStatement);
  public constructor(modifiers?: string[], type?: string, name?: string, container?: UniExpr, statement?: UniStatement) {
    super();
    if (modifiers === undefined && type === undefined && name === undefined && container === undefined && statement === undefined) {
      this.modifiers = [];
      this.type = null;
      this.name = null;
      this.container = null;
      this.statement = null;
    } else if (modifiers === undefined || type === undefined || name === undefined || container === undefined || statement === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.modifiers = modifiers;
      this.type = type;
      this.name = name;
      this.container = container;
      this.statement = statement;
    }
    this.fields.set('modifiers', String);
    this.fields.set('type', String);
    this.fields.set('name', String);
    this.fields.set('container', UniExpr);
    this.fields.set('statement', UniStatement);
  }

  public toString(): string {
    return 'EnhancedFor(' + this.type + ', ' + this.name + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniEnhancedFor)) return false;
    const that: UniEnhancedFor = <UniEnhancedFor>obj;
    return super.equals(that)
        && (this.modifiers == null ? that.modifiers == null : this.modifiers.equals(that.modifiers))
        && (this.type == null ? that.type == null : this.type === that.type)
        && (this.name == null ? that.name == null : this.name === that.name)
        && (this.container == null ? that.container == null : this.container.equals(that.container))
        && (this.statement == null ? that.statement == null : this.statement.equals(that.statement));
  }

  public merge(that: UniEnhancedFor) {
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
    if (that.name != null) {
      this.name = that.name;
    }
    if (that.container != null) {
      this.container = that.container;
    }
    if (that.statement != null) {
      this.statement = that.statement;
    }
  }
}
