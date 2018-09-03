import * as fs from 'fs';
class Field {
  public constructor(public name:string, public type:string) {}
}

class Node { 
  public className:string = '';
  public isAbstract:boolean = false;
  public superClassName:string = null;
  public members:Field[] = [];
  public children:Node[] = [];

  public constructor ({ className, members = null, isAbstract = false, superClassName = null, children = null } 
    : {className: string, members?: [string, string][], isAbstract?: boolean, superClassName?:string, children?: Node[]}) {
    this.className += `Uni${className}`;
    this.isAbstract = isAbstract;
    if (superClassName) {
      this.superClassName = `${superClassName}`;
    }
    if (members) {
      for (let [name,type] of members) {
        if (this.isStartUpper(type) && !this.isNodeHepler(type)) {
          type = `Uni${type}`;
        }
        this.members.push(new Field(name,type));
      }
    }
    if (children) {
      children.forEach((element, index, array) => { 
        element.superClassName = this.className; 
      });
      this.children = children;
    }
  }

  private isStartUpper(str:string):boolean {
    return str.charAt(0).match(/^[A-Z]+$/) ? true : false;
  }

  private isNodeHepler(str:string):boolean {
    return str.includes(`CodeRange`);
  }
  private indent(n:number):string {
    const space = `\u0020\u0020`;
    let ret = ``;
    for (let i = 0; i < n; ++i) {
      ret += space;
    }
    return ret;
  }

  private makeImportText():string {
    let ret:string = '';
    const imports:string[] = [];
    if (this.superClassName) {
      imports.push(this.superClassName);
      ret += `import ${this.superClassName} from './${this.superClassName}';\n`;
    }
    for (const field of this.members) {
      const type = field.type;
      if (type.startsWith(`Uni`)) {
        if (type.endsWith(`[]`)) {
          const t = type.slice(0, -2);
          if (!imports.includes(t)) {
            imports.push(t);
            ret += `import ${t} from './${t}';\n`;
          }
        } else {
          if (!imports.includes(type)) {
            imports.push(type);
            ret += `import ${type} from './${type}';\n`;
          }
        }
      } else if (this.isNodeHepler(type)) {
        ret += `import ${type} from '../node_helper/${type}';`;
      }
    }
    if (this.className === 'UniNode') {
      ret += `require('../node_helper/Extension');`;
    }
    return ret;
  }

  private makeClassDecText():string {
    let ret:string = '';
    ret += `export default `;
    if (this.isAbstract) {
      ret += `abstract `;
    }
    ret += `class ${this.className} `;
    if (this.superClassName) {
      ret += `extends ${this.superClassName} `;
    }
    return ret;
  }

  private makeMemberText():string {
    let ret:string = '';
    // member
    const s1 = `${this.indent(1)}`;
    for (const field of this.members) {
      ret += `${s1}public ${field.name}: ${field.type};\n`;
    }
    if (this.className === 'UniNode') {
      ret += `${s1}public fields: Map<string,Function>;\n`;
    }
    return ret;
  }

  private makeConstructor():string {
    let ret:string = '';
    // member
    const s1 = `${this.indent(1)}`;
    const s2 = `${this.indent(2)}`;
    const s3 = `${this.indent(3)}`;
    // constructor
    ret += `${s1}public constructor();\n`;
    ret += `${s1}public constructor(`;
    for (const field of this.members) {
      ret += `${field.name}: ${field.type}, `;
    }
    ret = ret.slice(0, -2);
    ret += `);\n`;

    ret += `${s1}public constructor(`;
    for (const field of this.members) {
      ret += `${field.name}?: ${field.type}, `;
    }
    ret = ret.slice(0, -2);
    ret += `) {\n`;

    if (this.superClassName) {
      ret += `${s2}super();\n`;
    }
    ret += `${s2}if (`;
    for (const field of this.members) {
      ret += `${field.name} === undefined && `;
    }
    ret = ret.slice(0, -4);
    ret += `) {\n`;

    for (const field of this.members) {
      // if (field.type === 'string') {
      //   ret += `${s3}this.${field.name} = '';\n`;
      // }
      if (field.type.includes('[]')) {
        ret += `${s3}this.${field.name} = [];\n`;
      } else {
        ret += `${s3}this.${field.name} = null;\n`;
      }
      // if (field.type.includes('Uni')) {
      //   ret += `${s3}this.${field.name} = new ${field.type}();\n`;
      // }
    }

    ret += `${s2}}`;

    if (1 < this.members.length) {
      ret += ` else if (`;
      for (const field of this.members) {
        ret += `${field.name} === undefined || `;
      }
      ret = ret.slice(0, -4);
      ret += `)`;
      ret += ` {\n${s3}throw new Error('invalid arguments');\n${s2}}`;
    }
    ret += ` else {\n`;
    for (const field of this.members) {
      ret += `${s3}this.${field.name} = ${field.name};\n`;
    }
    ret += `${s2}}\n`;

    if (this.className === 'UniNode') {
      ret += `${s2}this.fields = new Map<string,Function>();\n`;
      ret += `${s2}this.fields.set('comments', String);\n`;
      ret += `${s2}this.fields.set('codeRange', CodeRange);\n`;
    } else {
      for (const field of this.members) {
        ret += `${s2}this.fields.set('${field.name}', `;
        if (field.type.includes(`string`)) {
          ret += `String`;
        } else if (field.type.includes(`boolean`)) {
          ret += `Boolean`;
        } else if (field.type.includes(`number`)) {
          ret += `Number`;
        } else if (field.type.includes(`any`)) {
          ret += `Object`;
        } else if (field.type.includes('[]')) {
          ret += field.type.substr(0,field.type.length - 2);
        } else {
          ret += field.type;
        }
        ret += `);\n`;
      }
    }
    ret += `${s1}}\n`;
    return ret;
  }

  private makeToStringText():string {
    // member
    const s1 = `${this.indent(1)}`;
    const s2 = `${this.indent(2)}`;
    let ret:string = `${s1}public toString(): string {\n`;
    ret += `${s2}return '${this.className.substr(3)}('`;
    let isFirst = true;
    for (const field of this.members) {
      if (field.type === 'string') {
        if (isFirst) {
          ret += ` + `;
          isFirst = false;
        } else if (!isFirst) {
          ret += ` + ', ' + `;
        }
        ret += `this.${field.name}`;
      }
    }

    ret += ` + ')';\n${s1}}\n`;
    return ret;
  }

  private makeToEqualsText():string {
    // member
    const s1 = `${this.indent(1)}`;
    const s2 = `${this.indent(2)}`;
    const s4 = `${this.indent(4)}`;
    let ret:string = `${s1}public equals(obj: any): boolean {\n`;
    ret += `${s2}if (obj == null || !(obj instanceof ${this.className})) return false;\n`;
    ret += `${s2}const that: ${this.className} = <${this.className}>obj;\n`;
    if (this.superClassName) {
      ret += `${s2}return super.equals(that)`;
    } else {
      ret += `${s2}return that !== null`;
    }
    if (this.className !== 'UniNode') {
      for (const field of this.members) {
        if (field.type === 'string' 
        || field.type === 'number' 
        || field.type === 'boolean' 
        || field.type === 'any') {
          ret += `\n${s4}&& (this.${field.name} == null ? that.${field.name} == null : this.${field.name} === that.${field.name})`;
        } else {
          ret += `\n${s4}&& (this.${field.name} == null ? that.${field.name} == null : this.${field.name}.equals(that.${field.name}))`;
        }
      }
    }

    ret += `;\n${s1}}\n`;
    return ret;
  }

  private makeMergeText():string {
    // member
    const s1 = `${this.indent(1)}`;
    const s2 = `${this.indent(2)}`;
    const s3 = `${this.indent(3)}`;
    const s4 = `${this.indent(4)}`;
    let ret:string = `${s1}public merge(that: ${this.className}) {\n`;
    if (this.superClassName) {
      ret += `${s2}super.merge(that);\n`;
    }
    for (const field of this.members) {
      ret += `${s2}if (that.${field.name} != null) {\n`;
      if (field.type.includes(`[]`)) {
        ret += `${s3}if (this.${field.name} == null) {\n`;
        ret += `${s4}this.${field.name} = that.${field.name};\n`;
        ret += `${s3}} else {\n`;
        ret += `${s4}this.${field.name}.push(...that.${field.name});\n`;
        ret += `${s3}}\n`;
      } else {
        ret += `${s3}this.${field.name} = that.${field.name};\n`;
      }
      ret += `${s2}}\n`;
    }

    ret += `${s1}}\n`;
    return ret;
  }
  public toString(): string {
    let ret:string = '';
    ret += `${this.makeImportText()}\n`;
    ret += `${this.makeClassDecText()}`;
    ret += `{\n`;
    if (0 < this.members.length) {
      ret += `${this.makeMemberText()}\n`;
      ret += `${this.makeConstructor()}\n`;
      ret += `${this.makeToStringText()}\n`;
      ret += `${this.makeToEqualsText()}\n`;
      ret += `${this.makeMergeText()}`;
    } else if (!this.isAbstract) {
      ret += `${this.makeToStringText()}\n`;
      ret += `${this.makeToEqualsText()}\n`;      
    }
    ret += `}\n`;
    return ret;
  }
  public write() {
    fs.writeFile(`src/node/${this.className}.ts`, this.toString(), (err) => {
      if (err) {
        return console.error(err);
      }
    });
    for (const child of this.children) {
      child.write();
    }
  }
}

export default class Generator {  
  public static generate() {
    const node = 
      new Node({ className :`Node`, isAbstract: true,
        members:[
        [`comments`, `string[]`],
        [`codeRange`, `CodeRange`],
        ],children: [
          new Node({ className :`Program`,
            members:[
            [`block`, `Block`],
            ]}),
          new Node({ className :`Expr`, isAbstract: true,
            children: [
              new Node({ className :`NumberLiteral`,
                members:[
                [`value`, `any`],
                [`signed`, `boolean`],
                [`bytes`, `number`],
                [`isFloat`, `boolean`],
                [`type`, `string`],
                [`prefix`, `string`],
                [`sufix`, `string`],
                ],
                children: [
                  new Node({ className :`IntLiteral`,
                    members:[
                      [`value`, `number`],
                    ],
                  }),
                  new Node({ className :`DoubleLiteral`,
                    members:[
                      [`value`, `number`],
                    ],
                  }),
                  new Node({ className :`CharacterLiteral`,
                    members:[
                      [`value`, `string`],
                    ],
                  }),
                ],
              }),
              new Node({ className :`StringLiteral`,
                members:[
                [`value`, `string`],
                ]}),
              new Node({ className :`BoolLiteral`,
                members:[
                [`value`, `boolean`],
                ]}),
              new Node({ className :`Cast`,
                members:[
                [`type`, `string`],
                [`value`, `Expr`],
                ]}),
              new Node({ className :`Ident`,
                members:[
                [`name`, `string`],
                ]}),
              new Node({ className :`Array`,
                members:[
                [`items`, `Expr[]`],
                ]}),
              // new Node({ className :`FieldAccess`,
              //   members:[
              //   [`receiver`, `Expr`],
              //   [`fieldName`, `string`],
              //   [`index`, `Expr`],
              //   ]}),
              new Node({ className :`MethodCall`,
                members:[
                [`receiver`, `Expr`],
                [`methodName`, `Ident`],
                [`args`, `Expr[]`],
                ]}),
              new Node({ className :`UnaryOp`,
                members:[
                [`operator`, `string`],
                [`expr`, `Expr`],
                ]}),
              new Node({ className :`BinOp`,
                members:[
                  [`operator`, `string`],
                  [`left`, `Expr`],
                  [`right`, `Expr`],
                ]}),
              new Node({ className :`TernaryOp`,
                members:[
                  [`cond`, `Expr`],
                  [`trueExpr`, `Expr`],
                  [`falseExpr`, `Expr`],
                ]}),
              new Node({ className :`Statement`, isAbstract: true,
                children: [
                  new Node({ className :`Break` }),
                  new Node({ className :`Continue` }),
                  new Node({ className :`EmptyStatement` }),
                  new Node({ className :`Return` ,
                    members:[
                      [`value`, `Expr`],
                    ]}),
                  new Node({ className :`Jump` ,
                    members:[
                      [`dest`, `string`],
                    ]}),
                  new Node({ className :`Label` ,
                    members:[
                      [`name`, `string`],
                    ]}),
                  new Node({ className :`Block`,
                    members:[
                      [`blockLabel`, `string`],
                      [`body`, `Statement[]`],
                    ]}),
                  new Node({ className :`If`,
                    members:[
                      [`cond`, `Expr`],
                      [`trueStatement`, `Statement`],
                      [`falseStatement`, `Statement`],
                    ]}),
                  new Node({ className :`For`,
                    members:[
                      [`init`, `Expr`],
                      [`cond`, `Expr`],
                      [`step`, `Expr`],
                      [`statement`, `Statement`],
                    ]}),     
                  new Node({ className :`EnhancedFor`,
                    members:[
                      [`modifiers`, `string[]`],
                      [`type`, `string`],
                      [`name`, `string`],
                      [`container`, `Expr`],
                      [`statement`, `Statement`],
                    ]}),     
                  new Node({ className :`While`,
                    members:[
                      [`cond`, `Expr`],
                      [`statement`, `Statement`],
                    ],
                    children:[
                      new Node({ className :`DoWhile` }),
                    ],
                  }),      
                  new Node({ className :`Switch`,
                    members:[
                      [`cond`, `Expr`],
                      [`cases`, `SwitchUnit[]`],
                    ],
                  }),
                  new Node({ className :`SwitchUnit`,
                    members:[
                    [`label`, `string`],
                    [`cond`, `Expr`],
                    [`statement`, `Statement[]`],
                    ],
                  }), 
                ],
              }),
              new Node({ className :`Decralation`, isAbstract: true,
                children: [
                  new Node({ className :`ClassDec`,
                    members:[
                      [`className`, `string`],
                      [`modifiers`, `string[]`],
                      [`members`, `Decralation[]`],
                      [`superClass`, `string[]`],
                      [`interfaces`, `string[]`],
                    ]}),
                  new Node({ className :`FunctionDec`,
                    members:[
                      [`name`, `string`],
                      [`modifiers`, `string[]`],
                      [`returnType`, `string`],
                      [`params`, `Param[]`],
                      [`block`, `Block`],
                    ]}),                       
                  new Node({ className :`VariableDef`,
                    members:[
                      [`name`, `string`],
                      [`value`, `Expr`],
                      [`typeSuffix`, `string`],
                    ]}),     
                  new Node({ className :`VariableDec`,
                    members:[
                      [`modifiers`, `string[]`],
                      [`type`, `string`],
                      [`variables`, `VariableDef[]`],
                    ],
                    children:[
                      new Node({ className :`Param` }),
                    ]}),
                ],
              }),             
            ],
          }),
        ]});
    node.write();
  }
}
Generator.generate();
