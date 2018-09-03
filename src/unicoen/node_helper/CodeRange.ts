import CodeLocation from './CodeLocation';

export default class CodeRange {
  public begin: CodeLocation;
  public end: CodeLocation;
  public constructor(begin: CodeLocation, end: CodeLocation) {
    this.begin = new CodeLocation(begin.x, begin.y);
    this.end = new CodeLocation(end.x, end.y);
  }
  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof CodeRange)) return false;
    const that: CodeRange = <CodeRange>obj;
    return this.begin.equals(that.begin) && this.end.equals(that.end);
  }
}
