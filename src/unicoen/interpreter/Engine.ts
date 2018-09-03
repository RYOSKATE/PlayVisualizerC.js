import { assert } from 'chai';
import Scope from './Scope';
import UniExpr from '../node/UniExpr';
import UniMethodCall from '../node/UniMethodCall';
import UniIdent from '../node/UniIdent';
import UniBoolLiteral from '../node/UniBoolLiteral';
import UniStringLiteral from '../node/UniStringLiteral';
import UniUnaryOp from '../node/UniUnaryOp';
import UniBinOp from '../node/UniBinOp';
import UniTernaryOp from '../node/UniTernaryOp';
import UniBreak from '../node/UniBreak';
import UniContinue from '../node/UniContinue';
import UniReturn from '../node/UniReturn';
import UniVariableDec from '../node/UniVariableDec';
import UniBlock from '../node/UniBlock';
import UniIf from '../node/UniIf';
import UniFor from '../node/UniFor';
import UniWhile from '../node/UniWhile';
import UniDoWhile from '../node/UniDoWhile';
import UniArray from '../node/UniArray';
import UniCast from '../node/UniCast';
import UniStatement from '../node/UniStatement';
import UniEmptyStatement from '../node/UniEmptyStatement';
import UniJump from '../node/UniJump';
import UniLabel from '../node/UniLabel';
import UniSwitchUnit from '../node/UniSwitchUnit';
import UniDecralation from '../node/UniDecralation';
import UniProgram from '../node/UniProgram';
import UniFunctionDec from '../node/UniFunctionDec';
import UniClassDec from '../node/UniClassDec';
import UniParam from '../node/UniParam';
import UniVariableDef from '../node/UniVariableDef';
import UniNode from '../node/UniNode';
import UniSwitch from '../node/UniSwitch';
import ExecState from './ExecState';
import UniCharacterLiteral from '../node/UniCharacterLiteral';
import UniNumberLiteral from '../node/UniNumberLiteral';
import RuntimeException from './RuntimeException';
import { clone } from '../node_helper/clone';
import * as math from 'mathjs';
import { isArray } from 'util';
import File from './File';


export class ControlException extends RuntimeException {
}

export class Break extends ControlException {
}

export class Continue extends ControlException {
}

export class Return extends ControlException {
  public constructor(public readonly value: any) {
    super();
  }
}

export default class Engine {

  public constructor() { }

  private isDebugMode: boolean = false;
  private isCurrentExprSet: boolean = false;
  protected currentState: ExecState = null;
  private _stdout: string = '';
  private _stdin: string = '';
  protected currentScope: Scope = null;
  protected execStepItr: IterableIterator<any> = null;
  private isWaitingForStdin: boolean = false;

  public setDebugMode(enable: boolean) {
    this.isDebugMode = enable;
  }

  public getCurrentExpr(): UniNode {
    return this.currentState.getCurrentExpr();
  }
  public getCurrentState(): ExecState {
    return this.currentState;
  }

  public getStdout(): string {
    return this._stdout;
  }
  protected stdout(text: string): void {
    this._stdout += text;
  }
  private clearStdout() {
    this._stdout = '';
  }

  protected getStdin(): string {
    return this._stdin;
  }
  public stdin(text: string): void {
    this._stdin += text;
  }
  private clearStdin() {
    this._stdin = '';
  }

  public getIsWaitingForStdin(): boolean {
    return this.isWaitingForStdin;
  }
  public setIsWaitingForStdin(enable: boolean) {
    return this.isWaitingForStdin = enable;
  }

  public isStepExecutionRunning(): boolean {
    return this.execStepItr != null;
  }

  public setFileList(filelist: Map<string, ArrayBuffer>) {
    File.setFilelist(filelist);
  }

  protected loadLibarary(global: Scope) {

  }

  public startStepExecution(dec: UniProgram): ExecState {
    this.execStepItr = this.executeStepByStep(dec);
    return this.stepExecute();
  }

  public stepExecute(): ExecState {
    if (this.execStepItr == null) {
      return this.getCurrentState();
    }
    this.isCurrentExprSet = false;
    const node = this.execStepItr.next();
    const ret = node.value;
    this.currentState.setCurrenValue(ret);
    if (this.isDebugMode) {
      console.log(ret);
      // console.log(this.getCurrentExpr());
      // console.log(this.currentState.make());
    }
    if (node.done) {
      this.execStepItr = null;
    }
    this.currentState.make();
    return clone(this.currentState);
  }

  public * executeStepByStep(dec: UniProgram) {
    const main: UniFunctionDec = this.getEntryPoint(dec);
    if (main != null) {
      const global: Scope = Scope.createGlobal();
      this.setGlobalObjects(dec, global);
      this.loadLibarary(global);
      this.currentState = new ExecState(global);
      this.clearStdout();
      // loadLibarary(global);
      // firePreExecAll(global);
      // 初期化が完了して1行目に入る前の状態で最初は返す。
      this.currentState.setCurrentExpr(dec);
      yield true;

      const value = yield* this.execFunc(main, global, null);
      // firePostExecAll(global, value);
      global.closeAllFiles();
      return value;
    } else {
      throw new RuntimeException('No entry point in ' + dec);
    }
  }

  public execute(dec: UniProgram) {
    let ret = 0;
    let node;
    const gen = this.executeStepByStep(dec);
    do {
      node = gen.next();
      ret = node.value;
      if (this.isDebugMode) {
        console.log(ret);
        // console.log(this.getCurrentExpr());
        // console.log(this.currentState.make());
      }
    } while (!node.done);
    return ret;
  }

  private getEntryPoint(node: UniNode): UniFunctionDec {
    let entry: UniFunctionDec = null;
    if (node instanceof UniProgram) {
      const block: UniBlock = node.block;
      entry = this.getEntryPoint(block);
    } else if (node instanceof UniBlock) {
      for (const stateOfBlock of node.body) {
        entry = this.getEntryPoint(stateOfBlock);
        if (entry != null) break;
      }
    } else if (node instanceof UniDecralation) {
      const dec = node;
      if (dec instanceof UniFunctionDec) {
        if ('main' === dec.name) {
          return dec;
        }
      } else if (dec instanceof UniClassDec) {
        for (const member of dec.members) {
          if (member instanceof UniFunctionDec) {
            entry = this.getEntryPoint(member);
            if (entry != null) break;
          }
        }
      }
    }
    return entry;
  }

  private setGlobalObjects(node: UniNode, global: Scope) {
    if (node instanceof UniProgram) {
      const block: UniBlock = node.block;
      this.setGlobalObjects(block, global);
    } else if (node instanceof UniBlock) {
      for (const stateOfBlock of node.body) {
        this.setGlobalObjects(stateOfBlock, global);
      }
    } else if (node instanceof UniDecralation) {
      const dec = node;
      if (dec instanceof UniFunctionDec) {
        // 関数のセット
        if ('main' !== dec.name) {
          global.setTop(dec.name, dec, dec.returnType);
        }
      } else if (dec instanceof UniVariableDec) {
        // グローバル変数のセット
        this.execExpr(node, global);
      } else if (dec instanceof UniClassDec) {
        // structのセット
        for (const member of dec.members) {
          if (member instanceof UniFunctionDec) {
            this.setGlobalObjects(member, global);
          }
        }
      }
    }
  }

  public static executeSimpleExpr(expr: UniExpr): any;
  public static executeSimpleExpr(expr: UniExpr, scope: Scope): any;
  public static executeSimpleExpr(expr: UniExpr, scope?: Scope): any {
    if (scope === undefined) {
      return new Engine().execExpr(expr, scope);
    }
    return this.executeSimpleExpr(expr, Scope.createGlobal());
  }

  public static executeSimpleProgram(program: UniProgram): any {
    return this.executeSimpleExpr(program.block, Scope.createGlobal());
  }

  protected * execDecralation(dec: UniDecralation, scope: Scope) {
    if (dec instanceof UniVariableDec) {
      const uvd = <UniVariableDec>dec;
      return yield* this.execVariableDec(uvd, scope);
    }
    if (dec instanceof UniFunctionDec) {
    }
    if (dec instanceof UniClassDec) {
    }
  }
  protected * execStatement(state: UniStatement, scope: Scope): any {
    if (state instanceof UniIf) {
      return yield* this.execIf(state, scope);
    } else if (state instanceof UniFor) {
      return yield* this.execFor(state, scope);
    } else if (state instanceof UniWhile) {
      return yield* this.execWhile(state, scope);
    } else if (state instanceof UniDoWhile) {
      return yield* this.execDoWhile(state, scope);
    } else if (state instanceof UniBreak) {
      throw new Break();
    } else if (state instanceof UniContinue) {
      throw new Continue();
    } else if (state instanceof UniReturn) {
      throw new Return(yield* this.execExpr(state.value, scope));
    } else if (state instanceof UniBlock) {
      return yield* this.execBlock(state, scope);
    } else if (state instanceof UniSwitch) {
      yield* this.execSwitch(state, scope);
    } else if (state instanceof UniEmptyStatement) {
      return null;
    } else if (state instanceof UniLabel) {
    } else if (state instanceof UniJump) {
    } else if (state instanceof UniExpr) {
      return yield* this.execExpr(state, scope);
    }
    throw new RuntimeException('Not support expr type: ' + state);
  }

  protected * execBlock(block: UniBlock, scope: Scope) {
    const blockScope: Scope = Scope.createLocal(scope);
    blockScope.name = scope.name;
    let ret;
    for (const stateOfBlock of block.body) {
      ret = yield* this.execExpr(stateOfBlock, blockScope);
      // この中でさらにexecBlockが呼ばれた場合thisは？//Sumに代入されているかチェック
    }
    return ret;
  }

  protected * execIf(ui: UniIf, scope: Scope) {
    const cond = this.toBool(yield* this.execExpr(ui.cond, scope));
    if (cond) {
      return yield* this.execExpr(ui.trueStatement, scope);
    } else if (ui.falseStatement != null) {
      return yield* this.execExpr(ui.falseStatement, scope);
    }
  }

  protected * execFor(uf: UniFor, scope: Scope) {
    const forScope: Scope = Scope.createLocal(scope);
    forScope.name = scope.name;
    let ret;
    for (yield* this.execExpr(uf.init, forScope);
      this.toBool(yield* this.execExpr(uf.cond, forScope));
      yield* this.execExpr(uf.step, forScope)) {
      try {
        ret = yield* this.execExpr(uf.statement, forScope);// blockなのでgeneratorが返される。
      } catch (e) {
        if (e instanceof Continue) {
          continue;
        } else if (e instanceof Break) {
          break;
        } else {
          throw e;
        }
      }
    }
    return ret;
  }

  protected * execWhile(uw: UniWhile, scope: Scope) {
    const whileScope: Scope = Scope.createLocal(scope);
    whileScope.name = scope.name;
    let ret;
    while (this.toBool(yield* this.execExpr(uw.cond, whileScope))) {
      try {
        ret = yield* this.execExpr(uw.statement, whileScope);
      } catch (e) {
        if (e instanceof Continue) {
          continue;
        } else if (e instanceof Break) {
          break;
        } else {
          throw e;
        }
      }
    }
    return ret;
  }

  protected * execDoWhile(udw: UniDoWhile, scope: Scope) {
    const doWhileScope: Scope = Scope.createLocal(scope);
    doWhileScope.name = scope.name;
    let ret;
    do {
      try {
        ret = yield* this.execExpr(udw.statement, scope);
      } catch (e) {
        if (e instanceof Continue) {
          continue;
        } else if (e instanceof Break) {
          break;
        } else {
          throw e;
        }
      }
    } while (this.toBool(yield* this.execExpr(udw.cond, scope)));
    return ret;
  }

  protected * execSwitch(us: UniSwitch, scope: Scope) {
    const switchScope: Scope = Scope.createLocal(scope);
    switchScope.name = scope.name;
    let ret;
    const cond = yield* this.execExpr(us.cond, scope);
    for (const unit of us.cases) {
      const condOfCase = yield* this.execExpr(unit.cond, switchScope);
      if (cond === condOfCase) {
        try {
          for (const statement of unit.statement) {
            ret = yield* this.execExpr(statement, scope);
          }
        } catch (e) {
          if (e instanceof Continue) {
            continue;
          } else if (e instanceof Break) {
            break;
          } else {
            throw e;
          }
        }
      }
    }
    return ret;
  }

  protected * execExpr(expr: UniExpr, scope: Scope): any {
    // firePreExec(expr, scope);
    if (!this.isCurrentExprSet) {
      this.currentState.setCurrentExpr(expr);
      this.isCurrentExprSet = true;
    }
    const value = yield* this._execExpr(expr, scope);
    // firePostExec(expr, scope, value);
    return value;
  }

  // tslint:disable-next-line:function-name
  private * _execExpr(expr: UniExpr, scope: Scope): any {
    assert.ok(expr != null);
    if (expr instanceof UniStatement) {
      return yield* this.execStatement(expr, scope);
    } else if (expr instanceof UniDecralation) {
      return yield* this.execDecralation(expr, scope);
    } else if (expr instanceof UniMethodCall) {
      const mc = <UniMethodCall>expr;
      const args: any[] = [];
      for (let i = 0; mc.args !== null && i < mc.args.length; i++) {
        args.push(yield* this.execExpr(mc.args[i], scope));
      }
      this.currentScope = scope;
      let ret: any = null;
      if (mc.receiver != null) {
        const receiver: any = yield* this.execExpr(mc.receiver, scope);
        ret = yield* this.execMethodCall(receiver, mc.methodName.name, args);
      } else {
        const func: any = scope.get(mc.methodName.name);
        if (func instanceof UniFunctionDec) {
          ret = yield* this.execFunc(func, scope, mc.args);
        } else {
          ret = yield* this.execFuncCall(func, args);
        }
      }
      this.currentScope = null;
      return ret;
    } else if (expr instanceof UniIdent) {
      const ret = scope.get((<UniIdent>expr).name);
      yield ret;
      return ret;
    } else if (expr instanceof UniBoolLiteral) {
      const ret = (<UniBoolLiteral>expr).value;
      yield ret;
      return ret;
    } else if (expr instanceof UniCharacterLiteral) {
      const ret = this.execCharLiteral(expr, scope);
      yield ret;
      return ret;
    } else if (expr instanceof UniStringLiteral) {
      const ret = this.execStringLiteral(expr, scope);
      yield ret;
      return ret;
    } else if (expr instanceof UniNumberLiteral) {
      const ret = (<UniNumberLiteral>expr).value;
      yield ret;
      return ret;
    } else if (expr instanceof UniUnaryOp) {
      return yield* this.execUnaryOp(<UniUnaryOp>expr, scope);
    } else if (expr instanceof UniBinOp) {
      return yield* this.execBinOp(<UniBinOp>expr, scope);
    } else if (expr instanceof UniTernaryOp) {
      const condOp = <UniTernaryOp>expr;
      return this.toBool(yield* this.execExpr(condOp.cond, scope))
        ? yield* this.execExpr(condOp.trueExpr, scope)
        : yield* this.execExpr(condOp.falseExpr, scope);
    } else if (expr instanceof UniArray) {
      return yield* this.execArray(<UniArray>expr, scope);
    } else if (expr instanceof UniCast) {
      return this.execCast(<UniCast>expr, scope);
    }
    // if (expr instanceof UniNewArray) {
    //   UniNewArray uniNewArray = (UniNewArray) expr;// C言語ではtypeは取れない
    //   List<UniExpr > elementsNum = uniNewArray.elementsNum;// 多次元未対応
    //   int length = (int)this.execExpr(elementsNum.get(0),scope);// 多次元未対応
    //   UniArray value = uniNewArray.value;
    //   List < Object > array = new ArrayList<Object>();
    //   if (value.items == null) {
    //     for (int i = 0;i < length;++i) {
    //       array.add((byte)0);
    //     }
    //   }
    //   else {
    //     array = execArray(value,scope);
    //     for (int i = array.size();i < length;++i;) {
    //       array.add((byte)0);
    //     }
    //   }
    //   return array;
    // }
    throw new RuntimeException('Not support expr type: ' + expr);
  }

  protected execCast(expr: UniCast, scope: Scope): any {
    return this.execExpr(expr.value, scope);
  }
  // tslint:disable-next-line:function-name
  protected _execCast(type: string, value: any): any {
    return value;
  }

  protected execCharLiteral(expr: UniCharacterLiteral, scope: Scope): any {
    return expr.value;
  }

  protected execStringLiteral(expr: UniStringLiteral, scope: Scope): any {
    return expr.value;
  }

  private * execFunc(fdec: UniFunctionDec, scope: Scope, args: UniExpr[]): any {
    const funcScope: Scope = Scope.createLocal(scope);
    funcScope.name = funcScope.getNextName(fdec.name);

    // 実引数を仮引数に代入
    const params: UniParam[] = fdec.params;
    if (params != null && args != null) {
      assert.ok(params.length === args.length);
      for (let i = 0; i < args.length; ++i) {
        const param: UniParam = params[i];
        const arg: UniExpr = args[i];
        const name = param.variables[0].name;
        const type = param.type;
        const value = yield* this.execExpr(arg, scope);
        funcScope.setTop(name, value, type);
      }
    }
    // ToDo再起の場合のチェック(連番など?
    // スコープも呼び出し先関数中とGLOBAL以外はスキップさせる
    let ret = null;
    try {
      yield* this.execBlock(fdec.block, funcScope);
    } catch (e) {
      if (e instanceof Return) {
        ret = e.value;
      }
    }
    if (funcScope.name !== 'main') {
      scope.removeChild(funcScope);
    }
    return ret;
  }

  protected execBinOp(binOp: UniBinOp, scope: Scope): any;
  protected execBinOp(op: string, scope: Scope, left: UniExpr, right: UniExpr): any;
  protected * execBinOp(arg: string | UniBinOp, scope: Scope, left?: UniExpr, right?: UniExpr): any {
    if (arg instanceof UniBinOp && left === undefined && right === undefined) {
      const binOp = <UniBinOp>arg;
      return yield* this.execBinOp(binOp.operator, scope, binOp.left, binOp.right);
    } else if (typeof arg === 'string' && left instanceof UniExpr && right instanceof UniExpr) {
      const op = <string>arg;
      let ret = null;
      switch (op) {
        case '=': {
          const r = yield* this.execExpr(right, scope);
          const l = this.getAddress(left, scope);
          ret = this.execAssign(l, r, scope);
          yield ret;
          return ret;
        }
        case '[]':
        case '.': {
          ret = scope.getValue((this.getAddress(new UniBinOp(op, left, right), scope)));
          yield ret;
          return ret;
        }
        // case '()': {
        //   const umc = new UniMethodCall(null,(<UniIdent>left).name,((UniArray)right).items);
        //   return this.execExpr(umc,scope);
        // }
        // 		case ".":
        // 			return this.execExpr(getLeftReference(new UniBinOp(op,left,right),scope),scope);
        default:
          break;
      }

      const l = yield* this.execExpr(left, scope);
      const r = yield* this.execExpr(right, scope);
      switch (op) {
        case '==':
          ret = l === r;
          break;
        case '!=':
          ret = l !== r;
          break;
        case '<':
          ret = l < r;
          break;
        case '>':
          ret = l > r;
          break;
        case '>=':
          ret = l >= r;
          break;
        case '<=':
          ret = l <= r;
          break;
        case '+':
          ret = l + r;
          break;
        case '-':
          ret = l - r;
          break;
        case '*':
          ret = l * r;
          break;
        case '/':
          ret = l / r;
          break;
        case '%':
          ret = l % r;
          break;
        case '&&':
          ret = l && r;
          break;
        case '&&':
          ret = l || r;
          break;
      }
      if (ret !== null) {
        yield ret;
        return ret;
      }
      // 複合代入演算子
      if (op.length > 1 && op.charAt(op.length - 1) === '=') {
        if (left instanceof UniIdent) {
          const nextOp: string = op.substring(0, op.length - 1);
          const value = yield* this.execBinOp(nextOp, scope, left, right);
          return this.execAssign(this.getAddress(<UniIdent>left, scope), value, scope);
        }
      }
      throw new RuntimeException('Unkown binary operator: ' + op);
    }
  }

  protected execAssign(address: number, value: any, scope: Scope): any {
    const type: string = scope.getType(address);
    // value = this._execCast(type,value);
    scope.set(address, value);
    if (type.endsWith('*')) {
      const taddress = <number>value;
      if (scope.isMallocArea(taddress)) {
        const size = scope.getMallocSize(taddress);
        for (let i = 0; i < size; ++i) {
          scope.typeOnMemory.set(taddress + i, type.substring(0, type.length - 1));
        }
      }
    }
    return value;
  }

  *execUnaryOp(uniOp: UniUnaryOp, scope: Scope): any {
    switch (uniOp.operator) {
      case '!':
        return !this.toBool(yield* this.execExpr(uniOp.expr, scope));
      case '-': {
        const value = yield* this.execExpr(uniOp.expr, scope);
        if (typeof value === 'number') {
          return -value;
        }
      }
      case '_++':
      case '++_':
      case '_--':
      case '--_':
        if (uniOp.expr instanceof UniIdent) {
          const ident = <UniIdent>uniOp.expr;
          const num = <number>(yield* this.execExpr(uniOp.expr, scope));
          const address = this.getAddress(ident, scope);
          switch (uniOp.operator) {
            case '_++':
              this.execAssign(address, num + 1, scope);
              yield num;
              return num;
            case '++_':
              yield num + 1;
              return this.execAssign(address, num + 1, scope);
            case '_--':
              this.execAssign(address, num - 1, scope);
              yield num;
              return num;
            case '--_':
              yield num + 1;
              return this.execAssign(address, num - 1, scope);
          }
        }
      case '()': {
        const v = yield* this.execExpr(uniOp.expr, scope);
        return v;
      }
    }
    throw new RuntimeException('Unkown binary operator: ' + uniOp.operator);
  }

  protected getType(expr: UniExpr, scope: Scope): string {
    if (expr instanceof UniIdent) {
      const ui: UniIdent = expr;
      return scope.getType(ui.name);
    } else if (expr instanceof UniUnaryOp) {
      const uuo: UniUnaryOp = expr;
      if (uuo.operator === '*') {
        return this.getType(uuo.expr, scope);
      }
    } else if (expr instanceof UniBinOp) {
      const ubo: UniBinOp = expr;
      if (ubo.operator === '[]') {
        const left: string = this.getType(ubo.left, scope);
        if (left != null) {
          return left;
        }
        const right: string = this.getType(ubo.right, scope);
        if (right != null) {
          return right;
        }
      }
    }
    return null;
  }

  getAddress(expr: UniExpr, scope: Scope): number {
    if (expr instanceof UniIdent) {
      const ui = <UniIdent>expr;
      return scope.getAddress(ui.name);
    } else if (expr instanceof UniUnaryOp) {
      const uuo = <UniUnaryOp>expr;
      if (uuo.operator === '*') {
        let refAddress = null;
        for (const execExpr of this.execExpr(uuo.expr, scope)) {
          refAddress = execExpr;
        }
        return refAddress;
      }
    } else if (expr instanceof UniBinOp) {
      const ubo = <UniBinOp>expr;
      if (ubo.operator === '[]') {
        return this.getAddress(new UniUnaryOp('*', new UniBinOp('+', ubo.left, ubo.right)), scope);
      } else if (ubo.operator === '.') {
        const startAddress: number = this.execExpr(ubo.left, scope);
        const type: string = this.getType(ubo.left, scope);
        const offsets: Map<string, number> = scope.get(type);
        const offset: number = offsets.get((<UniIdent>ubo.right).name);
        return startAddress + offset;
      }
    }
    throw new RuntimeException('Assignment failure: ' + expr);
  }

  execMethod(arg0: any, arg1: any, arg2: any): any {
    throw new Error('execMethod not implemented.');
  }

  *execArray(uniArray: UniArray, scope: Scope) {
    const elements = uniArray.items;
    const array: any[] = [];
    for (const element of elements) {
      const e = yield* this.execExpr(element, scope);
      array.push(e);
    }
    return array;
  }

  *execVariableDec(decVar: UniVariableDec, scope: Scope) {
    let value = null;
    for (const def of decVar.variables) {
      while (def.name.startsWith('*')) {
        def.name = def.name.substring(1);
        decVar.type += '*';
      }
      while (def.name.startsWith('&')) {
        def.name = def.name.substring(1);
        decVar.type += '&';
      }

      // 初期化されている場合
      if (def.value != null) {
        value = yield* this.execExpr(def.value, scope);
        value = this._execCast(decVar.type, value);
        if (decVar.type.endsWith('*') && !Array.isArray(value)) {
          if (value instanceof String) {
            value = scope.setStatic(value, 'char[]');
          } else {
            const address = <number>value;
            if (scope.isMallocArea(address)) {
              const size: number = scope.getMallocSize(address);
              const type = decVar.type.substring(0, decVar.type.length - 1);
              const typeSize = this.sizeof(type);
              for (let i = 0; i < size; i += typeSize) {
                scope.typeOnMemory.set(address + i, type);
              }
            }
          }
        }
      }

      // 配列の場合
      let length = 0;
      if (def.typeSuffix != null && def.typeSuffix !== '') {
        const sizes: number[] = [];
        const typeSuffix: string = def.typeSuffix;
        for (let k = 0; k < typeSuffix.length; ++k) {
          const left = typeSuffix.indexOf('[', k);
          const right = typeSuffix.indexOf(']', k);
          const size = typeSuffix.slice(left + 1, right);
          sizes.push(Number.parseInt(size));
          k = right;
        }
        if (0 < sizes.length) {
          length = sizes[0];
          if (value != null) { // 初期化している場合。
            for (let i = value.length; i < length; ++i) {
              value.push(0);
            }
          } else {
            value = [];
            for (let i = 0; i < length; ++i) {
              value.push(this.randInt32());
            }
          }
        }
      }

      // // 未初期化の配列でない変数の場合、乱数で初期化する。
      // if (value == null) {
      //   value = this.randInt32();
      //   yield value;
      // }

      const type: string = decVar.type;
      scope.setTop(def.name, value, type);
    }
    return value;
  }

  public sizeof(type: string): number {
    if (type.includes('char')) {
      return 1;
    } else if (type.includes('short')) {
      return 2;
    } else if (type.includes('double')) {
      return 8;
    }
    return 4;
  }

  toDouble(obj: any): number {
    if (typeof obj === 'number') {
      return obj as number;
    }
    throw new Error('Cannot covert to integer: ' + obj);
  }

  toBool(obj: any): boolean {
    if (typeof obj === 'boolean') {
      return obj as boolean;
    }
    throw new Error('Cannot covert to boolean: ' + obj);
  }

  private *execFuncCall(func: any, arg: any[]): any {
    if (func == null) {
      throw new RuntimeException('func is null');
    } else if (func instanceof Function) {
      const ret = (<Function>func).apply(this, arg);
      if (ret && (typeof ret.next === 'function')) {
        let yieldObj = { done: false, value: null };
        while (!yieldObj.done) {
          yieldObj = ret.next(arg);
          yield yieldObj.value;
        }
        return yieldObj.value;
      }
      yield ret;
      return ret;
    }
    throw new Error('Not support function type: ' + func);
  }

  execMethodCall(arg0: any, arg1: any, arg2: any): any {
    throw new Error('execMethodCall not implemented.');
  }

  protected randInt32(): number {
    const a = math.pow(2, 32);
    const v = math.randomInt(0, <number>a);
    return v;
  }
}
