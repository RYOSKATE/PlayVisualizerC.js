// const fs = require('fs');
const unicoen = require('./unicoen').default;

class Field {
    constructor() {
        this.count = 0;
        this.engine = new unicoen.CPP14Engine();
        //this.baos = new ByteArrayOutputStream();
        this.stateHistory = new Array();// <string>
        this.outputsHistory = new Array();// <string>
        this.textOnEditor = "";
        this.isFirstEOF = false;
    }
}

class Server {
    constructor() {
        this.field = new Field();
        this.tmpDirName = 'pvc-tmp';
        this.isExecuting = false;
    }

    isFieldExist() {
        return this.field != null;
    }

    getField() {
        return this.field;
    }

    // getUserDir() {
    //     if (fs.accessSync(this.tmpDirName)) {
    //         fs.mkdirSync(this.tmpDirName); // mkdir -p
    //     }
    //     return this.tmpDirName;
    // }

    // public getUserDirFilesStr(uuid: String): Array<String> {
    //     const dirpStr = this.getUserDir(uuid);
    //     const dirList = this.getListOfPaths(dirpStr);;
    //     const filenamesStr = dirList.map{ _.getName };
    //     return filenamesStr
    // }

    // public flatten(list: Array<any>): Array<UniNode> {
    //     const nodes = new Array<UniNode>();
    //     for (const element of list) {
    //         if (element instanceof UniNode) {
    //             nodes.add(element.asInstanceOf[UniNode])
    //         }
    //         else {
    //             const l = flatten(element.asInstanceOf[util.List[Object]]);
    //             for (node < - l) {
    //                 nodes.add(node)
    //             }
    //         }
    //     }
    //     return nodes
    // }
    // const files = fs.readdirSync(dir);
    // public getListOfPaths(dir: String): Array<String> {
    //     if (d.exists) {
    //         let files = d.listFiles.filter(_.isFile).toList;
    //         d.listFiles.filter(_.isDirectory).foreach{
    //             dir =>
    //                 files = files ::: getListOfPaths(dir.getAbsolutePath)
    //         }
    //         files
    //     }
    //     else {
    //         List[JFile]()
    //     }
    // }

    // public upload = Action(parse.multipartFormData) {
    // request =>
    //     const uuid = getUUIDfromSession(request.session);
    //     // tmpにディレクトリ作成
    //     const dirp = Paths.get("/tmp", uuid)//Path;
    //     if (Files.notExists(dirp)) Files.createDirectories(dirp) // mkdir -p
    //     const currentDir = new JFile(".").getAbsoluteFile().getParent();
    //     request.body.file("files").map {
    //         file =>
    //         const filename = file.filename;
    //             file.ref.moveTo(new JFile(dirp.toString, filename), replace = true)//replace:true
    //         }
    //         const dirpStr = dirp.toString;
    //         const dirList = getListOfPaths(dirpStr);
    //         const filenamesStr = dirList.map{ _.getName };
    //         // List[JFile]なのでJFileをStringに変えたList[String]にmapして作る
    //         //各Stringの親ディレクトリ部分を削除
    //         //

    //         const json = Json.obj(;
    //         //"uuid" -> uuid,
    //         //"currentDir" -> currentDir,
    //         //"dirp" -> dirp.toString,
    //         //"num" -> request.body.file("files").size,
    //         "filenames" -> filenamesStr
    // )
    //         Ok(Json.stringify(json)).withSession("uuid" -> uuid)
    //     }

    //         public delete (filename : String)  = Action {
    //         implicit request =>
    //     const uuid = getUUIDfromSession(request.session);
    //             const dir = Paths.get("/tmp", uuid);
    //             const file = new JFile(dir.toString, filename);
    //             file.delete()
    //             const json = Json.obj(;
    //             "filenames" -> getUserDirFilesStr(uuid)
    // )
    //             Ok(Json.stringify(json)).withSession("uuid" -> uuid)
    //         }

    //             public download(filename : String) = Action {
    //             implicit request =>
    //     const uuid = getUUIDfromSession(request.session);
    //                 const dir = Paths.get("/tmp", uuid);
    //                 const file = new JFile(dir.toString, filename);
    //                 Ok.sendFile(content = file, inline = false)
    //             }

    ajaxCall(obj) {
        const stackData = obj["stackData"];
        const debugState = obj["debugState"];
        const output = obj["output"];
        const sourcetext = obj["sourcetext"];
        switch (debugState) {
            case "debug": {
                this.resetEngine().textOnEditor = sourcetext;
                const node = this.rawDataToUniTree(this.field.textOnEditor);//UniProgram
                const state = this.field.engine.startStepExecution(node);
                const stackData = this.recordExecState(state);
                const stdout = this.field.engine.getStdout();
                const output = this.recordOutputText(stdout);
                this.isExecuting = true;
                const ret = {
                    "stackData": stackData,
                    "debugState": "in Debugging",
                    "output": output,
                    "sourcetext": sourcetext
                };
                return ret;
            }
            case "exec": {
                const json = {
                    "stackData": stackData,
                    "debugState": "step",
                    "output": output,
                    "sourcetext": sourcetext
                };
                let ret;
                do {
                    ret = this.ajaxCall(json);
                } while (ret.debugState != "EOF");
                return ret;
            }
            case "reset": {
                this.field.count = 0
                const stackData = this.field.stateHistory[this.field.count];
                const output = this.field.outputsHistory[this.field.count];
                const ret = {
                    "stackData": stackData,
                    "debugState": ("Step:" + this.field.count),
                    "output": output,
                    "sourcetext": sourcetext
                };
                return ret;
            }
            case "step": {
                this.field.count += 1
                if (this.field.count < this.field.stateHistory.length - 1) {
                    const stackData = this.field.stateHistory[this.field.count];
                    const output = this.field.outputsHistory[this.field.count];
                    const ret = {
                        "stackData": stackData,
                        "debugState": `Step:${this.field.count} | Value:${stackData.getCurrentValue()}`,
                        "output": output,
                        "sourcetext": sourcetext
                    };
                    return ret;
                } else if (this.isExecuting) {
                    if (this.field.engine.getIsWaitingForStdin()) {
                        const stdinText = obj["stdinText"];
                        this.field.engine.setIn(stdinText);
                    }
                    let state = this.field.engine.stepExecute();
                    while (state.getCurrentExpr().codeRange == null) {
                        state = this.field.engine.stepExecute();
                    }
                    const stackData = this.recordExecState(state);
                    const stdout = this.field.engine.getStdout();
                    const output = this.recordOutputText(stdout);
                    let stateText = `Step:${this.field.count} | Value:${stackData.getCurrentValue()}`;
                    if (this.field.engine.getIsWaitingForStdin()) {
                        stateText = "scanf";
                    } else if (!this.field.engine.isStepExecutionRunning()) {
                        stateText = "EOF";
                        this.isExecuting = false;
                    }
                    const ret = {
                        "stackData": stackData,
                        "debugState": stateText,
                        "output": output,
                        "sourcetext": sourcetext
                    };
                    return ret;
                } else {
                    this.field.count = this.field.stateHistory.length - 1
                    const ret = {
                        "stackData": this.getLastHistory(),
                        "debugState": "EOF",
                        "output": "",
                        "sourcetext": sourcetext
                    };
                    return ret;
                }
            }
            case "back": {
                if (1 <= this.field.count) {
                    this.field.count -= 1
                }
                const stackData = this.field.stateHistory[this.field.count];
                const output = this.field.outputsHistory[this.field.count];
                const ret = {
                    "stackData": stackData,
                    "debugState": `Step:${this.field.count} | Value:${stackData.getCurrentValue()}`,
                    "output": output,
                    "sourcetext": sourcetext
                };
                return ret;
            }
            case "stop": {
                this.field.engine = null
                const ret = {
                    "stackData": this.getLastHistory(),
                    "debugState": "STOP",
                    "output": "",
                    "sourcetext": sourcetext
                };
                return ret;
            }
            default:
                return obj;
        }
    }

    rawDataToUniTree(string) {
        return (new unicoen.CPP14Mapper()).parse(string);
    }

    resetEngine() {
        this.field = new Field();
        // this.field.engine.setFileDir(this.getUserDir());
        // this.field.engine.out = new PrintStream(this.field.baos);
        return this.field;
    }
    //                 public getUUIDfromSession(session: Session): String {
    //                 let uuid = java.util.UUID.randomUUID().toString();
    //                 if (session.get("uuid") != None) {
    //                     uuid = session.get("uuid").get
    //                 }

    //                 if (!isFieldExist(uuid)) {
    //                     resetEngine(uuid)
    //                 }
    //                 return uuid
    //             }

    recordOutputText(output) {
        this.field.outputsHistory.push(output);
        return output;
    }

    recordExecState(execState) {
        this.field.stateHistory.push(execState);
        return execState;
    }

    getLastHistory() {
        return this.field.stateHistory[this.field.stateHistory.length - 1];
    }
}

const server = new Server();
export default server;
