import UniDecralation from './UniDecralation';

export default class UniClassDec extends UniDecralation {
  public className: string;
  public modifiers: string[];
  public members: UniDecralation[];
  public superClass: string[];
  public interfaces: string[];

  public constructor();
  public constructor(className: string, modifiers: string[], members: UniDecralation[], superClass: string[], interfaces: string[]);
  public constructor(className?: string, modifiers?: string[], members?: UniDecralation[], superClass?: string[], interfaces?: string[]) {
    super();
    if (className === undefined && modifiers === undefined && members === undefined && superClass === undefined && interfaces === undefined) {
      this.className = null;
      this.modifiers = [];
      this.members = [];
      this.superClass = [];
      this.interfaces = [];
    } else if (className === undefined || modifiers === undefined || members === undefined || superClass === undefined || interfaces === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.className = className;
      this.modifiers = modifiers;
      this.members = members;
      this.superClass = superClass;
      this.interfaces = interfaces;
    }
    this.fields.set('className', String);
    this.fields.set('modifiers', String);
    this.fields.set('members', UniDecralation);
    this.fields.set('superClass', String);
    this.fields.set('interfaces', String);
  }

  public toString(): string {
    return 'ClassDec(' + this.className + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniClassDec)) return false;
    const that: UniClassDec = <UniClassDec>obj;
    return super.equals(that)
        && (this.className == null ? that.className == null : this.className === that.className)
        && (this.modifiers == null ? that.modifiers == null : this.modifiers.equals(that.modifiers))
        && (this.members == null ? that.members == null : this.members.equals(that.members))
        && (this.superClass == null ? that.superClass == null : this.superClass.equals(that.superClass))
        && (this.interfaces == null ? that.interfaces == null : this.interfaces.equals(that.interfaces));
  }

  public merge(that: UniClassDec) {
    super.merge(that);
    if (that.className != null) {
      this.className = that.className;
    }
    if (that.modifiers != null) {
      if (this.modifiers == null) {
        this.modifiers = that.modifiers;
      } else {
        this.modifiers.push(...that.modifiers);
      }
    }
    if (that.members != null) {
      if (this.members == null) {
        this.members = that.members;
      } else {
        this.members.push(...that.members);
      }
    }
    if (that.superClass != null) {
      if (this.superClass == null) {
        this.superClass = that.superClass;
      } else {
        this.superClass.push(...that.superClass);
      }
    }
    if (that.interfaces != null) {
      if (this.interfaces == null) {
        this.interfaces = that.interfaces;
      } else {
        this.interfaces.push(...that.interfaces);
      }
    }
  }
}
