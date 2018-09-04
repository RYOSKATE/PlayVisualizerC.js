import Variable from './Variable';
import RuntimeException from './RuntimeException';

export default class Stack {
  private variables:Variable[] = [];
	// 引数(variables)あり版も必要
  public constructor(public readonly name:string,
                     public readonly address:number) {
  }

  addVariable(variable:Variable):void;
  addVariable(type:string, name:string, value:any, depth:any):void;

  addVariable(arg0:string|Variable, name?:string, value?:any, depth?:any):void {
    if (arg0 instanceof Variable) {
      const variable = <Variable>arg0;
      this.variables.push(variable);
      return;
    } else if (name === undefined || value === undefined || depth === undefined) {
      throw new RuntimeException('args erro');
    }
    const type = <string>arg0;
    let lastAddress = this.address;
    if (this.variables.length !== 0) {
      const lastVar:Variable = this.variables[this.variables.length - 1];
      lastAddress = lastVar.address;
      lastAddress += lastVar.getByteSize();
    }
    const _var:Variable = new Variable(type, name, value, lastAddress, depth);
    this.variables.push(_var);
  }

  updateVariable(name:string, value:any) {
    for (let i = this.variables.length - 1; 0 <= i; --i) {
      const _var:Variable = this.variables[i]; // 内側のスコープから探すため逆順に探索
      if (_var.hasValue(name)) {
        _var.setValue(name, value);
        break;
      }
    }
  }

  public removeVariables(depth:number):void {
    this.variables = this.variables.filter((v, i) => {
      return !(depth <= v.depth);
    });
  }

  public getVariables():Variable[] {
    return this.variables;
  }

  public getByteSize():number {
    let sum = 0;
    for (const _var of this.variables) {
      sum += _var.getByteSize();
    }
    return sum;
  }

  public toString():string {
    return 'Stack [name=' + this.name + ', variables=' + this.variables + ', address=' + this.address + ']';
  }
}
