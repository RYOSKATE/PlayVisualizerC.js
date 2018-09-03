import UniWhile from './UniWhile';

export default class UniDoWhile extends UniWhile {
  public toString(): string {
    return 'DoWhile(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniDoWhile)) return false;
    const that: UniDoWhile = <UniDoWhile>obj;
    return super.equals(that);
  }

}
