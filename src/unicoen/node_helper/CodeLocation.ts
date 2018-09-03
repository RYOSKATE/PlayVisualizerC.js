/* Generated from Java with JSweet 2.0.0 - http://www.jsweet.org */
export default class CodeLocation {
  public x: number;
  public y: number;
  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof CodeLocation)) return false;
    const that: CodeLocation = <CodeLocation>obj;
    return (this.x === that.x) && (this.y === that.y);
  }
}
