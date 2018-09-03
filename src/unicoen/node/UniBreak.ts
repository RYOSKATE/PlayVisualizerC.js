import UniStatement from './UniStatement';

export default class UniBreak extends UniStatement {
  public toString(): string {
    return 'Break(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniBreak)) return false;
    const that: UniBreak = <UniBreak>obj;
    return super.equals(that);
  }

}
