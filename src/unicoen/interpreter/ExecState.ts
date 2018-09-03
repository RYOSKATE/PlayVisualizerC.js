import UniNode from '../node/UniNode';
import Stack from './Stack';
import Scope from './Scope';
import Variable from './Variable';
import UniVariableDec from '../node/UniVariableDec';

export default class ExecState {
  private currentValue:any;
  private currentExpr:UniNode;
  private stacks:Stack[] = [];
  private readonly stackOffset:number = 0x10000;
  private readonly global:Scope = null;
  
  public constructor(global?:Scope) {
    if (global !== undefined) {
      this.global = global;
    }
  }

  public make():ExecState {
    this.stacks = [];
    return this.makeImple(this.global);
  }

  private makeImple(scope:Scope):ExecState {
    if (!this.hasStack(scope.name)) {
      this.addStack(scope.name);
      if (scope.name === 'GLOBAL') {
        for (let i = 10000;i < 20000;++i) {
          if (scope.typeOnMemory.has(i)) {
            const type:string = scope.typeOnMemory.get(i);
            if (type === 'FUNCTION')
              continue;
            const value:any = scope.objectOnMemory.get(i);
            const variable = new Variable(type, 'Static:' + i, value, i, scope.depth);
            this.addVariable(scope.name, variable);
          }
        }
        for (let i = 20000;i < 50000;++i) {
          if (scope.typeOnMemory.has(i)) {
            const type:string = scope.typeOnMemory.get(i);
            if (type === 'FUNCTION')
              continue;
            const value:any = scope.objectOnMemory.get(i);
            const variable = new Variable(type, 'Heap:' + i, value, i, scope.depth);
            this.addVariable(scope.name, variable);
          }
        }
      }
    }
    const varList:string[] = [];
    for (const key of scope.variableAddress.keys()) {
      varList.push(key);
    }
    for (const varName of varList) {
      const type:string = scope.variableTypes.get(varName);
      if (type === 'FUNCTION')
        continue;
      let address:number = scope.variableAddress.get(varName);
      let value:any = scope.objectOnMemory.get(address);
      if (value instanceof UniNode)
        continue;
      if (value instanceof Function)
        continue;
      if (~type.indexOf('[') && ~type.indexOf(']')) {
        const length = Number(type.substring(type.lastIndexOf('[') + 1, type.length - 1));
        const list:any[] = [];
        for (let i = 0;i < length;++i) {
          const arrValue = scope.objectOnMemory.get(<number>value + i);
          list.push(arrValue);
        }
        address = value;
        value = list;
      }
      const variable = new Variable(type, varName, value, address, scope.depth);
      this.addVariable(scope.name, variable);
    }
    if (scope.children.length !== 0) {
      for (const child of scope.children) {
        this.makeImple(child);
      }
    }
    return this;
  }

  public addVariable(stackName:string, variable:Variable):void;
  public addVariable(stackName:string, decVar:UniVariableDec, value:any, depth:number):void;

  public addVariable(stackName:string, param2:Variable|UniVariableDec, value?:any, depth?:number):void {
    if (param2 instanceof Variable) {
      const variable:Variable = param2;
      for (let i = this.stacks.length - 1; 0 <= i; --i) {
        const stack:Stack = this.stacks[i];
        if (stack.name === stackName) {
          stack.addVariable(variable);
          break;
        }
      }
    } else if (param2 instanceof UniVariableDec && value !== undefined && depth !== undefined) {
      const decVar:UniVariableDec = param2;
      for (let i = this.stacks.length - 1; 0 <= i; --i) {
        const stack = this.stacks[i];
        if (stack.name === stackName) {
          for (const v of decVar.variables) {
            stack.addVariable(decVar.type, v.name, value, depth);
          } 
          break;
        }
      }
    }
  }

	// 引数(variables)あり版も必要
  public addStack(_name:string):string {
    let name = _name;
    if (this.stacks.isEmpty()) {
      const stack:Stack = new Stack(name, this.stackOffset);
      this.stacks.push(stack);
    } else {
      const lastStack:Stack = this.stacks[this.stacks.length - 1];
      let lastAddress = lastStack.address;
      lastAddress += lastStack.getByteSize();
      if (this.hasStack(name)) {
        for (let i = 2;   ;++i) {
          const indexName:string = name + '.' + i;
          if (!this.hasStack(indexName)) {
            name = indexName;
            break;
          }
        }
      }
      const stack = new Stack(name,lastAddress);
      this.stacks.push(stack);
    }
    return name;
  }

  public popStack():void {
    this.stacks.pop();
  }

	// 更新
  public updateVariable(stackName:string, varName:string, value:any) {
    for (let i = this.stacks.length - 1; 0 <= i; --i) {
      const stack:Stack = this.stacks[i];
      if (stack.name === stackName) {
        stack.updateVariable(varName, value);
        break;
      }
    }
  }

  public removeVariables(stackName:string, depth:number) {
    if (stackName === 'main' && depth < 2) {
      return;
    }
    for (let i = this.stacks.length - 1; 0 <= i; --i) {
      const stack = this.stacks[i];
      if (stack.name === stackName) {
        stack.removeVariables(depth);
        break;
      }
    }
  }

  public getCurrentValue():any {
    return this.currentValue;
  }

  public setCurrenValue(value:any) {
    this.currentValue = value;
  }

  public getCurrentExpr():UniNode {
    return this.currentExpr;
  }

  public setCurrentExpr(expr:UniNode) {
    this.currentExpr = expr;
  }

  public getStacks():Stack[] {
    return this.stacks;
  }

  public getByteSize():number {
    let sum = 0;
    for (const stack of this.stacks) {
      sum += stack.getByteSize();
    }
    return sum;
  }

  private hasStack(name:string):boolean {
    for (const stack of this.stacks) {
      if (stack.name === name) {
        return true;
      }
    }
    return false;
  }
}
