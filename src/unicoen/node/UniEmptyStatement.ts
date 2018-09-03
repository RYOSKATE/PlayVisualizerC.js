import UniStatement from './UniStatement';

export default class UniEmptyStatement extends UniStatement {
  public toString(): string {
    return 'EmptyStatement(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniEmptyStatement)) return false;
    const that: UniEmptyStatement = <UniEmptyStatement>obj;
    return super.equals(that);
  }

}
