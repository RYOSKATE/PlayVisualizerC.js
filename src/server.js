import { CPP14Engine, CPP14Mapper } from 'unicoen.ts';
import { ResetAllFileList } from './file';

class Server {
  constructor() {
    this.isExecuting = false;
    this.files = new Map();
    this.reset();
  }

  reset() {
    this.count = 0;
    this.engine = new CPP14Engine();
    this.stateHistory = new Array(); // <string>
    this.outputsHistory = new Array(); // <string>
    this.textOnEditor = '';
    this.isFirstEOF = false;
  }

  addFile(file) {
    var reader = new FileReader();
    reader.onload = function() {
      this.files.set(file.name, reader.result);
      ResetAllFileList(this.files);
    }.bind(this);
    reader.readAsArrayBuffer(file);
  }

  addFiles(files) {
    for (let i = 0; i < files.length; ++i) {
      this.addFile(files[i]);
    }
    return this.files;
  }

  deleteFile(filename) {
    this.files.delete(filename);
    ResetAllFileList(this.files);
    return this.files;
  }

  getFileNames() {
    const names = new Array();
    for (const file of this.files.keys()) {
      names.push(file);
    }
    return names;
  }

  upload(files) {
    const filenames = this.addFiles(files);
    const json = {
      filenames: filenames,
    };
    return json;
  }

  delete(filename) {
    const filenames = this.deleteFile(filename);
    const json = {
      filenames: filenames,
    };
    return json;
  }

  ajaxCall(obj) {
    const stackData = obj['stackData'];
    const debugState = obj['debugState'];
    const output = obj['output'];
    const sourcetext = obj['sourcetext'];
    switch (debugState) {
      case 'debug': {
        this.resetEngine();
        this.textOnEditor = sourcetext;
        const node = this.rawDataToUniTree(this.textOnEditor); //UniProgram
        const state = this.engine.startStepExecution(node);
        const stackData = this.recordExecState(state);
        const stdout = this.engine.getStdout();
        const output = this.recordOutputText(stdout);
        this.isExecuting = true;
        const ret = {
          stackData: stackData,
          debugState: 'in Debugging',
          output: output,
          sourcetext: sourcetext,
        };
        return ret;
      }
      case 'exec': {
        const json = {
          stackData: stackData,
          debugState: 'step',
          output: output,
          sourcetext: sourcetext,
        };
        let ret;
        do {
          ret = this.ajaxCall(json);
          if (ret == null || ret == undefined) break;
        } while (ret.debugState != 'EOF' && ret.debugState != 'stdin');
        return ret;
      }
      case 'reset': {
        this.count = 0;
        const stackData = this.stateHistory[this.count];
        const output = this.outputsHistory[this.count];
        const ret = {
          stackData: stackData,
          debugState: 'Step:' + this.count,
          output: output,
          sourcetext: sourcetext,
        };
        return ret;
      }
      case 'step': {
        ++this.count;
        if (this.count < this.stateHistory.length) {
          const stackData = this.stateHistory[this.count];
          const output = this.outputsHistory[this.count];
          const ret = {
            stackData: stackData,
            debugState: `Step:${this.count} | Value:${stackData.getCurrentValue()}`,
            output: output,
            sourcetext: sourcetext,
          };
          return ret;
        } else if (this.isExecuting) {
          if (this.engine.getIsWaitingForStdin()) {
            const stdinText = obj['stdinText'];
            this.engine.stdin(stdinText);
            console.log(`stdin:${stdinText}`);
          }
          let state = this.engine.stepExecute();
          let maxSkip = 10;
          while (state.getCurrentExpr().codeRange == null && 0 < --maxSkip) {
            state = this.engine.stepExecute();
          }
          const stackData = this.recordExecState(state);
          const stdout = this.engine.getStdout();
          console.log(`stdout:${stdout}`);
          const output = this.recordOutputText(stdout);
          console.log(`output:${output}`);
          let stateText = `Step:${this.count} | Value:${stackData.getCurrentValue()}`;
          if (this.engine.getIsWaitingForStdin()) {
            stateText = 'stdin';
          } else if (!this.engine.isStepExecutionRunning()) {
            stateText = 'EOF';
            this.isExecuting = false;
            ResetAllFileList(this.files);
          }
          const ret = {
            stackData: stackData,
            debugState: stateText,
            output: output,
            sourcetext: sourcetext,
          };
          return ret;
        } else {
          this.count = this.stateHistory.length - 1;
          const ret = {
            stackData: this.getLastHistory(),
            debugState: 'EOF',
            output: '',
            sourcetext: sourcetext,
          };
          return ret;
        }
      }
      case 'back': {
        if (1 <= this.count) {
          this.count -= 1;
        }
        const stackData = this.stateHistory[this.count];
        const output = this.outputsHistory[this.count];
        const ret = {
          stackData: stackData,
          debugState: `Step:${this.count} | Value:${stackData.getCurrentValue()}`,
          output: output,
          sourcetext: sourcetext,
        };
        return ret;
      }
      case 'stop': {
        this.engine = null;
        const ret = {
          stackData: this.getLastHistory(),
          debugState: 'STOP',
          output: '',
          sourcetext: sourcetext,
        };
        return ret;
      }
      default:
        return obj;
    }
  }

  rawDataToUniTree(string) {
    const text = CPP14Engine.replaceDefine(string);
    return new CPP14Mapper().parse(text);
  }

  resetEngine() {
    this.reset();
    this.engine.setFileList(this.files);
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
    this.outputsHistory.push(output);
    return output;
  }

  getLastOutputText() {
    return this.outputsHistory[this.outputsHistory.length - 1];
  }

  recordExecState(execState) {
    this.stateHistory.push(execState);
    return execState;
  }

  getLastHistory() {
    return this.stateHistory[this.stateHistory.length - 1];
  }
}

const server = new Server();
export default server;
