import UniStatement from './UniStatement';

export default class UniBlock extends UniStatement {
  public blockLabel: string;
  public body: UniStatement[];

  public constructor();
  public constructor(blockLabel: string, body: UniStatement[]);
  public constructor(blockLabel?: string, body?: UniStatement[]) {
    super();
    if (blockLabel === undefined && body === undefined) {
      this.blockLabel = null;
      this.body = [];
    } else if (blockLabel === undefined || body === undefined) {
      throw new Error('invalid arguments');
    } else {
      this.blockLabel = blockLabel;
      this.body = body;
    }
    this.fields.set('blockLabel', String);
    this.fields.set('body', UniStatement);
  }

  public toString(): string {
    return 'Block(' + this.blockLabel + ')';
  }

  public equals(obj: any): boolean {
    if (obj == null || !(obj instanceof UniBlock)) return false;
    const that: UniBlock = <UniBlock>obj;
    return super.equals(that)
        && (this.blockLabel == null ? that.blockLabel == null : this.blockLabel === that.blockLabel)
        && (this.body == null ? that.body == null : this.body.equals(that.body));
  }

  public merge(that: UniBlock) {
    super.merge(that);
    if (that.blockLabel != null) {
      this.blockLabel = that.blockLabel;
    }
    if (that.body != null) {
      if (this.body == null) {
        this.body = that.body;
      } else {
        this.body.push(...that.body);
      }
    }
  }
}
