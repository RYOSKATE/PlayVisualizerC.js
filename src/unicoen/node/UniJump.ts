import UniStatement from './UniStatement';

export default class UniJump extends UniStatement {
  public dest: string;

  public constructor();
  public constructor(dest: string);
  public constructor(dest?: string) {
    super();
    if (dest === undefined) {
      this.dest = null;
    } else {
      this.dest = dest;
    }
    this.fields.set('dest', String);
  }

  public toString(): string {
    return 'Jump(' + this.dest + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniJump)) return false;
    const that: UniJump = <UniJump>obj;
    return super.equals(that)
        && (this.dest == null ? that.dest == null : this.dest === that.dest);
  }

  public merge(that: UniJump) {
    super.merge(that);
    if (that.dest != null) {
      this.dest = that.dest;
    }
  }
}
