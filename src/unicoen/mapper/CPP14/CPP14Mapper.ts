// tslint:disable
import CodeLocation from '../../node_helper/CodeLocation';
import CodeRange from '../../node_helper/CodeRange';
import UniNode from '../../node/UniNode';
import UniParam from '../../node/UniParam';
import UniEnhancedFor from '../../node/UniEnhancedFor';
import UniExpr from '../../node/UniExpr';
import UniArray from '../../node/UniArray';
import UniNumberLiteral from '../../node/UniNumberLiteral';
import UniBinOp from '../../node/UniBinOp';
import UniBlock from '../../node/UniBlock';
import UniBoolLiteral from '../../node/UniBoolLiteral';
import UniBreak from '../../node/UniBreak';
import UniCast from '../../node/UniCast';
import UniContinue from '../../node/UniContinue';
import UniClassDec from '../../node/UniClassDec';
import UniDoWhile from '../../node/UniDoWhile';
import UniEmptyStatement from '../../node/UniEmptyStatement';
import UniFunctionDec from '../../node/UniFunctionDec';
import UniFor from '../../node/UniFor';
import UniIdent from '../../node/UniIdent';
import UniIf from '../../node/UniIf';
import UniIntLiteral from '../../node/UniIntLiteral';		
import UniDoubleLiteral from '../../node/UniDoubleLiteral';
import UniCharacterLiteral from '../../node/UniCharacterLiteral';
import UniWhile from '../../node/UniWhile';
import UniUnaryOp from '../../node/UniUnaryOp';
import UniTernaryOp from '../../node/UniTernaryOp';
import UniStatement from '../../node/UniStatement';
import UniStringLiteral from '../../node/UniStringLiteral';
import UniReturn from '../../node/UniReturn';
import UniVariableDec from '../../node/UniVariableDec';
import UniVariableDef from '../../node/UniVariableDef';
import UniSwitchUnit from '../../node/UniSwitchUnit';
import UniSwitch from '../../node/UniSwitch';
import UniMethodCall from '../../node/UniMethodCall';
import UniProgram from '../../node/UniProgram';

import { ANTLRInputStream, 
	CommonTokenStream, 
	ParserRuleContext, 
	RuleContext, 
	Token } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { CPP14Visitor } from './CPP14Visitor';
import { CPP14Parser, 
	TranslationunitContext,
PrimaryexpressionContext,
IdentexpressionContext,
IdexpressionlapperContext,
FunctioncallexpressionContext,
PostfixexpressionContext,
ExpressionlistContext,
BinaryexpressionContext,
UnaryexpressionContext,
TypeidlapperContext,
CastexpressionContext,
PmexpressionContext,
MultiplicativeexpressionContext,
AdditiveexpressionContext,
ShiftexpressionContext,
RelationalexpressionContext,
EqualityexpressionContext,
AndexpressionContext,
ExclusiveorexpressionContext,
InclusiveorexpressionContext,
LogicalandexpressionContext,
LogicalorexpressionContext,
ConditionalexpressionContext,
AssignmentexpressionContext,
ExpressionstatementContext,
CompoundstatementContext,
StatementseqContext,
SelectionstatementContext,
WhilestatementContext,
DowhilestatementContext,
IterationstatementContext,
EnhancedForStatementContext,
BreakStatementContext,
ContinueStatementContext,
ReturnStatementContext,
DeclarationseqContext,
MyclassbodyContext,
MyclassspecifierContext,
MyclassheadContext,
VariabledeclarationstatementContext,
VariabledeclarationContext,
VariableDeclaratorListContext,
VariableDeclaratorContext,
DimsContext,
TrailingtypespecifierContext,
InitdeclaratorlistContext,
DeclaratoridContext,
ParameterdeclarationclauseContext,
ParameterdeclarationlistContext,
ParameterdeclarationContext,
FunctiondefinitionContext,
FunctionheaderContext,
FunctiondeclaratorContext,
FunctionbodyContext,
InitializerlistContext,
BracedinitlistContext,
MyclassnameContext,
ClassspecifierContext,
ClassbodyContext,
ClassheadContext,
MemberspecificationContext,
MembervariabledeclarationstatementContext,
MembervariabledeclarationContext,
MemberdeclaratorlistContext,
MemberdeclaratorContext,
IntegerliteralContext,
CharacterliteralContext,
FloatingliteralContext,
StringliteralContext,
BooleanliteralContext} from './CPP14Parser';
import { CPP14Lexer } from './CPP14Lexer';
import { RuleNode } from 'antlr4ts/tree/RuleNode';
import { ErrorNode } from 'antlr4ts/tree/ErrorNode';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';

class Comment {
	constructor(readonly contents:string[], public parent:ParseTree){
	}
}

export default class CPP14Mapper implements CPP14Visitor<any> {

	private isDebugMode:boolean = false;
	private parser:CPP14Parser;
	private	_comments:Comment[] = [];
	private _lastNode:UniNode;
	private _nextTokenIndex:number;
	private _stream:CommonTokenStream;

	setIsDebugMode(isDebugMode:boolean) {
		this.isDebugMode = isDebugMode;
	}
	
	getRawTree(code) {
		const chars = new ANTLRInputStream(code);
		const lexer = new CPP14Lexer(chars);
		const tokens = new CommonTokenStream(lexer);
		this.parser = new CPP14Parser(tokens);
		const tree = this.parser.translationunit();
		return [tree, this.parser];
	}

	parse(code:string) {
		return this.parseCore(code);
	}

	
	parseCore(code:string) {
		let chars = new ANTLRInputStream(code);
		let lexer = new CPP14Lexer(chars);
		let tokens = new CommonTokenStream(lexer);
		this.parser = new CPP14Parser(tokens);
		let tree = this.parser.translationunit();

		this._comments = [];
		this._stream = tokens;
		this._lastNode = null;
		this._nextTokenIndex = 0;
		const ret = new UniProgram(this.visit(tree));
		ret.codeRange = ret.block.codeRange;
		
		if (this._lastNode !== null) {
			const count = this._stream.getTokens().length - 1
			for (var i = this._nextTokenIndex; i < count; i++) {
				const hiddenToken = this._stream.getTokens()[i]; // Includes skipped tokens (maybe)
				if (this._lastNode.comments === null) {
					this._lastNode.comments = [];
				}
				this._lastNode.comments.push(hiddenToken.text);
			}
		}
		return ret;
	}
	
	/*def parseFile(String path) {
		val inputStream = new FileInputStream(path)
		try {
			parseCore(new ANTLRInputStream(inputStream))
		} finally {
			inputStream.close
		}
	}
	
	def parseFile(String path, Function1<CPP14Parser, ParseTree> parseAction) {
		val inputStream = new FileInputStream(path)
		try {
			parseCore(new ANTLRInputStream(inputStream), parseAction)
		} finally {
			inputStream.close
		}
	}*/

	public visitChildren(node:RuleNode) {
		const n = node.childCount;
		const list:any[] = [];
		for (let i = 0; i < n;++i) {
			const c = node.getChild(i);
			const childResult = this.visit(c);
			list.push(childResult);
		}
		const flatten = this.flatten(list);
		return flatten;
	}

	public visit(tree:ParseTree) {
		const result = (() => {
			if (!this.isDebugMode) {
				return tree.accept(this);
			}
	 		if (!(tree instanceof RuleContext)) {
				return tree.accept(this);
			}
			const ruleName = this.getRuleName(tree);
			console.log('*** visit Rule : ' + ruleName + ' ***');
			const result = tree.accept(this);
			console.log('returned: ' + result);
			return result;
		})();

		const node = (Array.isArray(result) && result.length == 1) ? result[0] : result;
		if (node instanceof UniNode) {
			if(tree instanceof RuleContext) {
				const start = (tree as ParserRuleContext).start;
				const begin = new CodeLocation(start.charPositionInLine,start.line);
				const stop = (tree as ParserRuleContext).stop;
				const endPos = stop.charPositionInLine;
				const length = 1 + stop.stopIndex - stop.startIndex;
				const end = new CodeLocation(endPos + length, stop.line);
				node.codeRange = new CodeRange(begin,end);
			}
			let contents:string[]  = [];
			for (let i = this._comments.length - 1; i >= 0 && this._comments[i].parent == tree; i--) {
				for(const content of contents) {
					this._comments[i].contents.push(content);
				}
				contents = this._comments[i].contents;
				this._comments.splice(i, 1);
			}
			if (contents.length > 0) {
				if (node.comments === null) {
					node.comments = contents;
				} else {
					node.comments = node.comments.concat(contents);
				}
			}
			this._lastNode = node;
		} else {
			for (var i = this._comments.length - 1; i >= 0 && this._comments[i].parent == tree; i--) {
				this._comments[i].parent = this._comments[i].parent.parent
			}
			this._lastNode = null
		}
		return result;
	}

	isNonEmptyNode(node:ParseTree):boolean {
		if (node instanceof ParserRuleContext) {
			const n = node.childCount;
			if (n > 1) {
			return true;
			}
			// n === 1 && node.children.exists[isNonEmptyNode]
			return n === 1;
		} else {
			return true;
		}
	}
	
	getRuleName(node) {
		return this.parser.ruleNames[node.ruleIndex];
	}

	public visitTerminal(node:TerminalNode) {
		if (this.isDebugMode) {
			console.log("visit TERMINAL : " + node.text);
		}

		const token = node.symbol;
		if (token.type > 0) {
			const count = token.tokenIndex;
			const contents:string[] = [];
			let i = this._nextTokenIndex;
			for (; i < count; i++) {
				const hiddenToken = this._stream.getTokens()[i]; // Includes skipped getTokens() (maybe)
				if (this._lastNode !== null && this._stream.getTokens()[this._nextTokenIndex - 1].line == hiddenToken.line) {
					if (this._lastNode.comments === null) {
						this._lastNode.comments = [];
					}
					this._lastNode.comments.push(hiddenToken.text);
				} else {
					contents.push(hiddenToken.text);
				}
			}
			const count2 = this._stream.getTokens().length - 1;
			for (i = count + 1; i < count2 && this._stream.getTokens()[i].channel == Token.HIDDEN_CHANNEL &&
				this._stream.getTokens()[count].line == this._stream.getTokens()[i].line; i++) {
				contents.push(this._stream.getTokens()[i].text);
			}
			if (contents.length > 0) {
				this._comments.push(new Comment(contents, node.parent));
			}
			this._nextTokenIndex = i;
		}
		return token.text;
	}

	private flatten(obj:any) {
		if (Array.isArray(obj)) {
			if (obj.length === 1) {
			return this.flatten(obj[0]);
			}
			const ret = [];
			obj.forEach((it:any) => {
			ret.push(this.flatten(it));
			});
			return ret;
		}
	
		if (obj instanceof Map) {
			if (obj.size === 1) {
			for (const value of obj.values()) {
				return this.flatten(value);
			}
			}
			const ret = new Map<any, any>();
			obj.forEach((value: any, key: any) => {
			ret.set(key, this.flatten(value));
			});
			return ret;
		}
	
		return obj;
	}

	public castToList<T extends Function|String>(obj:any, clazz:T):T[] {
		const temp = this.flatten(obj);
		const ret = [];
		if (temp instanceof Map) {
		const add = temp.has('add');
		temp.forEach((value: any, key: any) => {
			switch (key) {
			case 'add': {
				if (value instanceof Map) {
				ret.push(this.castTo<T>(value, clazz));
				} else if (Array.isArray(value)) {
				value.forEach((it:any) => {
					const t = this.castTo(it, clazz);
					if (t != null) {
					ret.push(t);
					}
				});
				} else {
				ret.push(this.castToList(value, clazz));
				}
			} 
				break;
			default:
				if (!add) {
				ret.push(this.castToList(value, clazz));
				}
				break;
			}	
		});
		} else if (Array.isArray(temp)) {
		temp.forEach((it:any) => {
			ret.push(this.castToList(it, clazz));
		});
		} else {
		ret.push(this.castTo(temp, clazz));
		}
		return ret;
	}
	public castTo<T extends Function|String>(obj:any, clazz:any) {
		const temp = this.flatten(obj);
		const instance = new clazz();
		const fields = instance.fields;
		const fieldsName = [];
		for (let it in instance) {
		fieldsName.push(it);
		}
		if (temp instanceof Map) {
		if (clazz === String) {
			let builder = '';
			const hasAdd = temp.has('add');
			temp.forEach((value: any, key: any) => {
			switch (key) {
				case 'add': {
				builder += this.castTo<T>(value, clazz);
				}
				break;
				default: {
				if (!hasAdd) {
					builder += this.castTo<T>(value, clazz);
				}
				}
				break;
			}
			});
			return (builder.length > 0) ? builder : null;
		}
		temp.forEach((value: any, key: any) => {
			if (fieldsName.includes(key)) {
			const field:Function = fields.get(key);
			if (Array.isArray(instance[key])) {
			 		const list	= this.flatten(this.castToList(value, field));
				if(!Array.isArray(list)) {
				instance[key] = [list];
				} else {
				instance[key] = list;
				}
			} else if (value.length == 0
				&& (field == UniExpr || field == UniStatement )){
				instance[key] = null;
			} else {
				instance[key] = this.castTo(value, field);
			}
			}
		});
		return instance;
		}
		if (Array.isArray(temp)) {
		if (clazz === String) {
			let builder = '';
			temp.forEach((it:any) => {
			builder += (this.castTo(it, clazz));
			});
			return (builder.length > 0) ? builder : null;
		}
		const first = temp.find((it) => {
			return it instanceof clazz;
		});
		if (first === null) {
			try {
			return instance;
			} catch (e) {
			return null;
			}
		} else {
			return this.castTo<T>(first,clazz);
		}
		}
		if(temp != null) {
		return temp as T;
		}
		return instance;
	}

	public visitTranslationunit(ctx:TranslationunitContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const body = [];
		map.set("body", body);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 462: {
						body.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniBlock);
		return node;
	}

	public visitPrimaryexpression(ctx:PrimaryexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 465: {
						ret.push(this.visit(it));
					}
					break;
					case 468: {
						ret.push(this.visit(it));
					}
					break;
					case 471: {
						ret.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniUnaryOp);
		return node;
	}

	public visitIdentexpression(ctx:IdentexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const name = [];
		map.set("name", name);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 479: {
						name.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniIdent);
		return node;
	}

	public visitIdexpressionlapper(ctx:IdexpressionlapperContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const name = [];
		map.set("name", name);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 598: {
						name.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniIdent);
		return node;
	}

	public visitFunctioncallexpression(ctx:FunctioncallexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const args = [];
		map.set("args", args);
		const methodName = [];
		map.set("methodName", methodName);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 600: {
						methodName.push(this.visit(it));
					}
					break;
					case 602: {
						args.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniMethodCall);
		return node;
	}

	public visitPostfixexpression(ctx:PostfixexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 608: {
						ret.push(this.visit(it));
					}
					break;
					case 609: {
						ret.push(this.visit(it));
					}
					break;
					case 36: {
						left.push(this.visit(it));
					}
					break;
					case 676: {
						right.push(this.visit(it));
					}
					break;
					case 689: {
						right.push(this.visit(it));
					}
					break;
					case 695: {
						right.push(this.visit(it));
					}
					break;
					case 698: {
						right.push(this.visit(it));
					}
					break;
					case 701: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.LeftBracket: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.RightBracket: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Dot: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Arrow: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.PlusPlus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.MinusMinus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitExpressionlist(ctx:ExpressionlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const items = [];
		map.set("items", items);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 711: {
						items.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniArray);
		return node;
	}

	public visitBinaryexpression(ctx:BinaryexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 737: {
						ret.push(this.visit(it));
					}
					break;
					case 738: {
						ret.push(this.visit(it));
					}
					break;
					case 739: {
						ret.push(this.visit(it));
					}
					break;
					case 740: {
						ret.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitUnaryexpression(ctx:UnaryexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const expr = [];
		map.set("expr", expr);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 744: {
						expr.push(this.visit(it));
					}
					break;
					case 746: {
						expr.push(this.visit(it));
					}
					break;
					case 747: {
						operator.push(this.visit(it));
					}
					break;
					case 748: {
						expr.push(this.visit(it));
					}
					break;
					case 751: {
						expr.push(this.visit(it));
					}
					break;
					case 754: {
						expr.push(this.visit(it));
					}
					break;
					case 759: {
						expr.push(this.visit(it));
					}
					break;
					case 769: {
						expr.push(this.visit(it));
					}
					break;
					case 772: {
						ret.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.PlusPlus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.MinusMinus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Sizeof: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Identifier: {
						expr.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Alignof: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniUnaryOp);
		return node;
	}

	public visitTypeidlapper(ctx:TypeidlapperContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const name = [];
		map.set("name", name);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 775: {
						name.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniIdent);
		return node;
	}

	public visitCastexpression(ctx:CastexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const type = [];
		map.set("type", type);
		const value = [];
		map.set("value", value);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 866: {
						ret.push(this.visit(it));
					}
					break;
					case 868: {
						type.push(this.visit(it));
					}
					break;
					case 870: {
						value.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.RightParen: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniCast);
		return node;
	}

	public visitPmexpression(ctx:PmexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 875: {
						ret.push(this.visit(it));
					}
					break;
					case 68: {
						left.push(this.visit(it));
					}
					break;
					case 879: {
						right.push(this.visit(it));
					}
					break;
					case 882: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.DotStar: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.ArrowStar: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitMultiplicativeexpression(ctx:MultiplicativeexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 889: {
						ret.push(this.visit(it));
					}
					break;
					case 70: {
						left.push(this.visit(it));
					}
					break;
					case 893: {
						right.push(this.visit(it));
					}
					break;
					case 896: {
						right.push(this.visit(it));
					}
					break;
					case 899: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Star: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Div: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Mod: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitAdditiveexpression(ctx:AdditiveexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 906: {
						ret.push(this.visit(it));
					}
					break;
					case 72: {
						left.push(this.visit(it));
					}
					break;
					case 910: {
						right.push(this.visit(it));
					}
					break;
					case 913: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Plus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Minus: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitShiftexpression(ctx:ShiftexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 920: {
						ret.push(this.visit(it));
					}
					break;
					case 74: {
						left.push(this.visit(it));
					}
					break;
					case 924: {
						right.push(this.visit(it));
					}
					break;
					case 926: {
						operator.push(this.visit(it));
					}
					break;
					case 927: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.LeftShift: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitRelationalexpression(ctx:RelationalexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 935: {
						ret.push(this.visit(it));
					}
					break;
					case 76: {
						left.push(this.visit(it));
					}
					break;
					case 939: {
						right.push(this.visit(it));
					}
					break;
					case 942: {
						right.push(this.visit(it));
					}
					break;
					case 945: {
						right.push(this.visit(it));
					}
					break;
					case 948: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Less: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Greater: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.LessEqual: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.GreaterEqual: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitEqualityexpression(ctx:EqualityexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 955: {
						ret.push(this.visit(it));
					}
					break;
					case 78: {
						left.push(this.visit(it));
					}
					break;
					case 959: {
						right.push(this.visit(it));
					}
					break;
					case 962: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Equal: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.NotEqual: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitAndexpression(ctx:AndexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 969: {
						ret.push(this.visit(it));
					}
					break;
					case 80: {
						left.push(this.visit(it));
					}
					break;
					case 973: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.And: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitExclusiveorexpression(ctx:ExclusiveorexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 980: {
						ret.push(this.visit(it));
					}
					break;
					case 82: {
						left.push(this.visit(it));
					}
					break;
					case 984: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Caret: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitInclusiveorexpression(ctx:InclusiveorexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 991: {
						ret.push(this.visit(it));
					}
					break;
					case 84: {
						left.push(this.visit(it));
					}
					break;
					case 995: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Or: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitLogicalandexpression(ctx:LogicalandexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1002: {
						ret.push(this.visit(it));
					}
					break;
					case 86: {
						left.push(this.visit(it));
					}
					break;
					case 1006: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.AndAnd: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitLogicalorexpression(ctx:LogicalorexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1013: {
						ret.push(this.visit(it));
					}
					break;
					case 88: {
						left.push(this.visit(it));
					}
					break;
					case 1017: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.OrOr: {
						operator.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitConditionalexpression(ctx:ConditionalexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const trueExpr = [];
		map.set("trueExpr", trueExpr);
		const cond = [];
		map.set("cond", cond);
		const falseExpr = [];
		map.set("falseExpr", falseExpr);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1023: {
						ret.push(this.visit(it));
					}
					break;
					case 1024: {
						cond.push(this.visit(it));
					}
					break;
					case 1028: {
						falseExpr.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniTernaryOp);
		return node;
	}

	public visitAssignmentexpression(ctx:AssignmentexpressionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const left = [];
		map.set("left", left);
		const right = [];
		map.set("right", right);
		const operator = [];
		map.set("operator", operator);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1032: {
						ret.push(this.visit(it));
					}
					break;
					case 1033: {
						left.push(this.visit(it));
					}
					break;
					case 1034: {
						operator.push(this.visit(it));
					}
					break;
					case 1035: {
						right.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castTo(map, UniBinOp);
		return node;
	}

	public visitExpressionstatement(ctx:ExpressionstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1141: {
						ret.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		return map;
	}

	public visitCompoundstatement(ctx:CompoundstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const body = [];
		map.set("body", body);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1147: {
						body.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniBlock);
		return node;
	}

	public visitStatementseq(ctx:StatementseqContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 1152: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 1153: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniExpr)
		return node;
	}

	public visitSelectionstatement(ctx:SelectionstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const trueStatement = [];
		map.set("trueStatement", trueStatement);
		const falseStatement = [];
		map.set("falseStatement", falseStatement);
		const cond = [];
		map.set("cond", cond);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1161: {
						cond.push(this.visit(it));
					}
					break;
					case 1163: {
						trueStatement.push(this.visit(it));
					}
					break;
					case 1167: {
						cond.push(this.visit(it));
					}
					break;
					case 1169: {
						trueStatement.push(this.visit(it));
					}
					break;
					case 1171: {
						falseStatement.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniIf);
		return node;
	}

	public visitWhilestatement(ctx:WhilestatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const statement = [];
		map.set("statement", statement);
		const cond = [];
		map.set("cond", cond);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1201: {
						cond.push(this.visit(it));
					}
					break;
					case 1203: {
						statement.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniWhile);
		return node;
	}

	public visitDowhilestatement(ctx:DowhilestatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const statement = [];
		map.set("statement", statement);
		const cond = [];
		map.set("cond", cond);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1206: {
						statement.push(this.visit(it));
					}
					break;
					case 1209: {
						cond.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniDoWhile);
		return node;
	}

	public visitIterationstatement(ctx:IterationstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const init = [];
		map.set("init", init);
		const statement = [];
		map.set("statement", statement);
		const step = [];
		map.set("step", step);
		const cond = [];
		map.set("cond", cond);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1215: {
						init.push(this.visit(it));
					}
					break;
					case 1216: {
						cond.push(this.visit(it));
					}
					break;
					case 1220: {
						step.push(this.visit(it));
					}
					break;
					case 1224: {
						statement.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniFor);
		return node;
	}

	public visitEnhancedForStatement(ctx:EnhancedForStatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const container = [];
		map.set("container", container);
		const statement = [];
		map.set("statement", statement);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1228: {
						merge.push(this.visit(it));
					}
					break;
					case 1230: {
						container.push(this.visit(it));
					}
					break;
					case 1232: {
						statement.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniEnhancedFor);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniEnhancedFor));});
		return node;
	}

	public visitBreakStatement(ctx:BreakStatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniBreak);
		return node;
	}

	public visitContinueStatement(ctx:ContinueStatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniContinue);
		return node;
	}

	public visitReturnStatement(ctx:ReturnStatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const value = [];
		map.set("value", value);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1260: {
						value.push(this.visit(it));
					}
					break;
					case 1265: {
						value.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniReturn);
		return node;
	}

	public visitDeclarationseq(ctx:DeclarationseqContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 1275: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 140: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 1278: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniStatement)
		return node;
	}

	public visitMyclassbody(ctx:MyclassbodyContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 1284: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniVariableDec)
		return node;
	}

	public visitMyclassspecifier(ctx:MyclassspecifierContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const members = [];
		map.set("members", members);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1287: {
						merge.push(this.visit(it));
					}
					break;
					case 1289: {
						members.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniClassDec);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniClassDec));});
		return node;
	}

	public visitMyclasshead(ctx:MyclassheadContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const className = [];
		map.set("className", className);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1300: {
						className.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniClassDec);
		return node;
	}

	public visitVariabledeclarationstatement(ctx:VariabledeclarationstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 1351: {
							ret.push(this.visit(it));
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castToList(map, UniVariableDec)
		return node;
	}

	public visitVariabledeclaration(ctx:VariabledeclarationContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const variables = [];
		map.set("variables", variables);
		const modifiers = [];
		map.set("modifiers", modifiers);
		const type = [];
		map.set("type", type);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1357: {
						modifiers.push(this.visit(it));
					}
					break;
					case 1360: {
						type.push(this.visit(it));
					}
					break;
					case 1361: {
						variables.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniVariableDec);
		return node;
	}

	public visitVariableDeclaratorList(ctx:VariableDeclaratorListContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 1365: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 1367: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniVariableDef)
		return node;
	}

	public visitVariableDeclarator(ctx:VariableDeclaratorContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const typeSuffix = [];
		map.set("typeSuffix", typeSuffix);
		const name = [];
		map.set("name", name);
		const value = [];
		map.set("value", value);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1375: {
						name.push(this.visit(it));
					}
					break;
					case 1381: {
						name.push(this.visit(it));
					}
					break;
					case 1393: {
						value.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.LeftBracket: {
						typeSuffix.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.Integerliteral: {
						typeSuffix.push(this.flatten(this.visit(it)));
					}
					break;
					case CPP14Parser.RightBracket: {
						typeSuffix.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniVariableDef);
		return node;
	}

	public visitDims(ctx:DimsContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, String);
		return node;
	}

	public visitTrailingtypespecifier(ctx:TrailingtypespecifierContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, String);
		return node;
	}

	public visitInitdeclaratorlist(ctx:InitdeclaratorlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 1846: {
						add.push(this.visit(it));
					}
					break;
					case 1848: {
						add.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		return map;
	}

	public visitDeclaratorid(ctx:DeclaratoridContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, String);
		return node;
	}

	public visitParameterdeclarationclause(ctx:ParameterdeclarationclauseContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2036: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2042: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniParam)
		return node;
	}

	public visitParameterdeclarationlist(ctx:ParameterdeclarationlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2049: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 312: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2053: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniParam)
		return node;
	}

	public visitParameterdeclaration(ctx:ParameterdeclarationContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const variables = [];
		map.set("variables", variables);
		const modifiers = [];
		map.set("modifiers", modifiers);
		const type = [];
		map.set("type", type);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2062: {
						modifiers.push(this.visit(it));
					}
					break;
					case 2065: {
						type.push(this.visit(it));
					}
					break;
					case 2066: {
						variables.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniParam);
		return node;
	}

	public visitFunctiondefinition(ctx:FunctiondefinitionContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const block = [];
		map.set("block", block);
		const modifiers = [];
		map.set("modifiers", modifiers);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2072: {
						modifiers.push(this.visit(it));
					}
					break;
					case 2075: {
						merge.push(this.visit(it));
					}
					break;
					case 2079: {
						block.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniFunctionDec);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniFunctionDec));});
		return node;
	}

	public visitFunctionheader(ctx:FunctionheaderContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const returnType = [];
		map.set("returnType", returnType);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2081: {
						returnType.push(this.visit(it));
					}
					break;
					case 2084: {
						merge.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniFunctionDec);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniFunctionDec));});
		return node;
	}

	public visitFunctiondeclarator(ctx:FunctiondeclaratorContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const name = [];
		map.set("name", name);
		const params = [];
		map.set("params", params);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2086: {
						name.push(this.visit(it));
					}
					break;
					case 2088: {
						params.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniFunctionDec);
		return node;
	}

	public visitFunctionbody(ctx:FunctionbodyContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2094: {
						merge.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniBlock);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniBlock));});
		return node;
	}

	public visitInitializerlist(ctx:InitializerlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2120: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2122: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniExpr)
		return node;
	}

	public visitBracedinitlist(ctx:BracedinitlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const items = [];
		map.set("items", items);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2129: {
						items.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniArray);
		return node;
	}

	public visitMyclassname(ctx:MyclassnameContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, String);
		return node;
	}

	public visitClassspecifier(ctx:ClassspecifierContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const members = [];
		map.set("members", members);
		const merge = [];
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2143: {
						merge.push(this.visit(it));
					}
					break;
					case 2144: {
						members.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniClassDec);
		merge.forEach((it:any) => { node.merge(this.castTo(it, UniClassDec));});
		return node;
	}

	public visitClassbody(ctx:ClassbodyContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2147: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniVariableDec)
		return node;
	}

	public visitClasshead(ctx:ClassheadContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const className = [];
		map.set("className", className);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2159: {
						className.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		const node = this.castTo(map, UniClassDec);
		return node;
	}

	public visitMemberspecification(ctx:MemberspecificationContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2184: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2185: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2188: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						case 2190: {
							const results = this.flatten(this.visit(it));
							if(Array.isArray(results)){
								for (const result of results)
									add.push(result);
							}
							else
								add.push(results);
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castToList(map, UniVariableDec)
		return node;
	}

	public visitMembervariabledeclarationstatement(ctx:MembervariabledeclarationstatementContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const ret = [];
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2204: {
							ret.push(this.visit(it));
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		if (!ret.isEmpty()) {
			return ret;
		}
		const node = this.castToList(map, UniVariableDec)
		return node;
	}

	public visitMembervariabledeclaration(ctx:MembervariabledeclarationContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const modifiers = [];
		map.set("modifiers", modifiers);
		const type = [];
		map.set("type", type);
		const merge = [];
		const n = ctx.childCount;
		if (0<n) {
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);
				if (it instanceof RuleContext) {
					switch (it.invokingState) {
						case 2210: {
							modifiers.push(this.visit(it));
						}
						break;
						case 2213: {
							type.push(this.visit(it));
						}
						break;
						case 2214: {
							type.push(this.visit(it));
						}
						break;
						case 2220: {
							merge.push(this.visit(it));
						}
						break;
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				} else if (it instanceof TerminalNode) {
					switch (it.symbol.type) {
						default: {
							none.push(this.visit(it));
						}
						break;
					}
				}
			}
		}
		const node = this.castTo(map, UniVariableDec)
		const ret = [];
		this.castToList(merge, UniVariableDec).forEach( (it:any) => {
			it.merge(node);
			ret.push(it);
		});
		return ret;
	}

	public visitMemberdeclaratorlist(ctx:MemberdeclaratorlistContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const add = [];
		map.set("add", add);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2224: {
						add.push(this.visit(it));
					}
					break;
					case 356: {
						add.push(this.visit(it));
					}
					break;
					case 2228: {
						add.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		return map;
	}

	public visitMemberdeclarator(ctx:MemberdeclaratorContext) {
		const map = new Map<string,any>();
		const none = [];
		map.set("none", none);
		const name = [];
		map.set("name", name);
		const modifiers = [];
		map.set("modifiers", modifiers);
		const value = [];
		map.set("value", value);
		const n = ctx.childCount;
		for (let i = 0; i < n;++i) {
			const it = ctx.getChild(i);	
			if (it instanceof RuleContext) {
				switch (it.invokingState) {
					case 2234: {
						name.push(this.visit(it));
					}
					break;
					case 2235: {
						modifiers.push(this.visit(it));
					}
					break;
					case 2241: {
						name.push(this.visit(it));
					}
					break;
					case 2243: {
						value.push(this.visit(it));
					}
					break;
					case 2246: {
						name.push(this.visit(it));
					}
					break;
					case 2247: {
						value.push(this.visit(it));
					}
					break;
					case 2257: {
						value.push(this.visit(it));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			} else if (it instanceof TerminalNode) {
				switch (it.symbol.type) {
					case CPP14Parser.Identifier: {
						name.push(this.flatten(this.visit(it)));
					}
					break;
					default: {
						none.push(this.visit(it));
					}
					break;
				}
			}
		}
		return map;
	}

	public visitIntegerliteral(ctx:IntegerliteralContext) {
		const findFirst = (ctx) => {
			const n = ctx.childCount;
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);	
				if (it instanceof TerminalNode) {
					if (it.symbol.type == CPP14Parser.Integerliteral) {
						return it;
					}
				}
			}
			return undefined;
		};
		const text = this.visit(findFirst(ctx)) as String;
		return new UniIntLiteral(Number(text));
	}

	public visitCharacterliteral(ctx:CharacterliteralContext) {
		const findFirst = (ctx) => {
			const n = ctx.childCount;
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);	
				if (it instanceof TerminalNode) {
					if (it.symbol.type == CPP14Parser.Characterliteral) {
						return it;
					}
				}
			}
			return undefined;
		};
		const text = this.visit(findFirst(ctx)) as String;
		return new UniCharacterLiteral(text.substring(1, text.length - 1).charAt(0));
	}

	public visitFloatingliteral(ctx:FloatingliteralContext) {
		const findFirst = (ctx) => {
			const n = ctx.childCount;
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);	
				if (it instanceof TerminalNode) {
					if (it.symbol.type == CPP14Parser.Floatingliteral) {
						return it;
					}
				}
			}
			return undefined;
		};
		const text = this.visit(findFirst(ctx)) as String;
		return new UniDoubleLiteral(Number(text));
	}

	public visitStringliteral(ctx:StringliteralContext) {
		const findFirst = (ctx) => {
			const n = ctx.childCount;
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);	
				if (it instanceof TerminalNode) {
					if (it.symbol.type == CPP14Parser.Stringliteral) {
						return it;
					}
				}
			}
			return undefined;
		};
		const text = this.visit(findFirst(ctx)) as String;
		return new UniStringLiteral(text.substring(1, text.length - 1));
	}

	public visitBooleanliteral(ctx:BooleanliteralContext) {
		const findFirst = (ctx) => {
			const n = ctx.childCount;
			for (let i = 0; i < n;++i) {
				const it = ctx.getChild(i);	
				if (it instanceof TerminalNode) {
					if (it.symbol.type == CPP14Parser.Booleanliteral) {
						return it;
					}
				}
			}
			return undefined;
		};
		const text = this.visit(findFirst(ctx)) as String;
		return new UniBoolLiteral(Boolean(text));
	}
	visitErrorNode(node: ErrorNode): UniNode{
		return null;
	}
}
