export default class File
{
  private static filelist:Map<string, ArrayBuffer>;
  private pos:number = 0;
  private buf:Uint8Array;
  private toBeFlush:boolean = false;
  constructor(private readonly name:string,
              private readonly data:ArrayBuffer
    ,         private readonly mode:string) {
    this.buf = new Uint8Array(this.data);
  }

  public static setFilelist(filelist:Map<string, ArrayBuffer>) {
    File.filelist = filelist;
  }

  public static getFileFromFileList(filename:string):ArrayBuffer {
    return File.filelist.get(filename);
  }

  public static addFileToFileList(name:string, file:ArrayBuffer) {
    return File.filelist.set(name, file);
  }

  private resize() {
    const newBuf = new Uint8Array(new ArrayBuffer(2 * this.buf.length));
    for (let i = 0; i < this.buf.length; ++i) {
      newBuf[i] = this.buf[i];
    }
    this.buf = newBuf;
  }

  public flush() {
    const newBuf = new Uint8Array(new ArrayBuffer(this.pos));
    for (let i = 0; i < newBuf.length; ++i) {
      newBuf[i] = this.buf[i];
    }
    File.filelist[this.name] = newBuf;
  }

  public fclose() {
    if (this.isWriteMode()) {
      this.flush();
    }
  }

  private isBinaryMode():boolean {
    return this.mode.includes('b');
  }

  private isWriteMode():boolean {
    return this.mode.includes('w');
  }

  private isEOF():boolean {
    return this.buf.length <= this.pos;
  }

  public fputc(c:number):number {
    if (this.isEOF()) {
      this.resize();
    }
    this.buf[this.pos++] = c;
    return c;
  }

  public fgetc():number {
    if (this.isEOF()) {
      return -1;
    }
    const ret = this.buf[this.pos++];
    if (!this.isBinaryMode()) {
      if (ret === 0x0d && this.buf[this.pos] === 0x0a) {
        return this.fgetc();
      }
    }
    return ret;
  }

  public fgets(n:number):number[] {
    if (this.isEOF()) {
      return null;
    }
    const bytes:number[] = [];
    for (let i = 0; i < n - 1; ++i) {
      const c = this.fgetc();
      if (c === -1) {
        break;
      }
      bytes.push(c);
      if (c === '\n'.charCodeAt(0)) {
        break;
      }
    }
    bytes.push(0); // 終端文字
    return bytes;
  }
}
