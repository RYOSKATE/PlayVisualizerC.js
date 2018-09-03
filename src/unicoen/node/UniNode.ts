import CodeRange from '../node_helper/CodeRange';require('../node_helper/Extension');
export default abstract class UniNode {
  public comments: string[];
  public codeRange: CodeRange;
  public fields: Map<string,Function>;

  public constructor();
  public constructor(comments: string[], codeRange: CodeRange);
  public constructor(comments?: string[], codeRange?: CodeRange) {
    if (comments === undefined && codeRange === undefined) {
      this.comments = [];
      this.codeRange = null;
    } else if (comments === undefined || codeRange === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.comments = comments;
      this.codeRange = codeRange;
    }
    this.fields = new Map<string,Function>();
    this.fields.set('comments', String);
    this.fields.set('codeRange', CodeRange);
  }

  public toString(): string {
    return 'Node(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniNode)) return false;
    const that: UniNode = <UniNode>obj;
    return that !== null;
  }

  public merge(that: UniNode) {
    if (that.comments != null) {
      if (this.comments == null) {
        this.comments = that.comments;
      } else {
        this.comments.push(...that.comments);
      }
    }
    if (that.codeRange != null) {
      this.codeRange = that.codeRange;
    }
  }
}
