import UniVariableDec from './UniVariableDec';

export default class UniParam extends UniVariableDec {
  public toString(): string {
    return 'Param(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniParam)) return false;
    const that: UniParam = <UniParam>obj;
    return super.equals(that);
  }

}
