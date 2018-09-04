export default class Variable {

  public constructor(public readonly type: string, public readonly name: string,
                     private value: any, public readonly address: number,
                     public readonly depth: number) {
    this.setValue(value);
  }

  // 構造体や配列の場合はvalueそのままでなくArrayList<Variable> valuesなど

  public getValue(): any {
    return this.value;
  }

  public hasValue(name: string): boolean {
    if (this.name === name) {
      return true;
    }

    if (this.value instanceof Array) {
      const varArray: Variable[] = this.value;
      for (const _var of varArray) {
        if (_var.hasValue(this.name)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  public setValue(value: any, name?: string): void {
    if (name !== undefined) {
      if (this.name === name) {
        this.value = value;
      } else {
        if (this.value instanceof Array) {
          const varArray: Variable[] = this.value;
          for (let i = 0; i < varArray.length; ++i) {
            if (varArray[i].name === name) {
              varArray[i].setValue(this.value, name);
              break;
            }
          }
        }
      }
    }
    if (value instanceof Array) {
      const varArray: any[] = value;
      const vars: Variable[] = [];
      for (let i = 0; i < varArray.length; ++i) {
        let lastAddress = this.address;
        if (vars.length !== 0) {
          const lastVar: Variable = vars[vars.length - 1];
          lastAddress = lastVar.address;
          lastAddress += lastVar.getByteSize();
        }
        const element: any = varArray[i];
        if (element instanceof Variable) { // 構造体の場合
          const tempvar = <Variable>element;
          const _var = new Variable(tempvar.type, this.name + '.' + tempvar.name, tempvar.value, lastAddress, this.depth);
          vars.push(_var);
        } else {// 配列の場合
          const baseType: string = this.type.substring(0, this.type.lastIndexOf('['));
          const _var = new Variable(baseType, this.name + '[' + i + ']', element, lastAddress, this.depth);
          vars.push(_var);
        }
      }
      this.value = vars;
    } else {
      this.value = value;
    }
  }

  public getByteSize(): number {
    if (this.value instanceof Array) {
      const vars: Variable[] = this.value;
      const size = vars.length;
      return vars[size - 1].getByteSize() * size;
    }
    // 処理系依存かもしれないが、リテラルのサイズ、構造体はメンバ変数のsize合計、配列の場合は型*size()などを考慮する必要がある。
    return 1; // CppEngine.sizeof(this.type);
  }

  public toString(): string {
    return 'Variable [type=' + this.type + ', name=' + this.name + ', value=' + this.value + ', '
      + 'address=' + this.address + ', depth=' + this.depth + ']';
  }
}
