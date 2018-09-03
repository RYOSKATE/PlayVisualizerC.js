import UniNode from './UniNode';
import UniBlock from './UniBlock';

export default class UniProgram extends UniNode {
  public block: UniBlock;

  public constructor();
  public constructor(block: UniBlock);
  public constructor(block?: UniBlock) {
    super();
    if (block === undefined) {
      this.block = null;
    } else {
      this.block = block;
    }
    this.fields.set('block', UniBlock);
  }

  public toString(): string {
    return 'Program(' + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniProgram)) return false;
    const that: UniProgram = <UniProgram>obj;
    return super.equals(that)
        && (this.block == null ? that.block == null : this.block.equals(that.block));
  }

  public merge(that: UniProgram) {
    super.merge(that);
    if (that.block != null) {
      this.block = that.block;
    }
  }
}
