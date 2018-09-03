export default class RuntimeException implements Error {
  public name = 'RuntimeException';
  public message = '';
  
  constructor(message?: string) {
    if (message !== undefined) {
      this.message = message;
    }
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}

export class UniRuntimeError extends RuntimeException {
  public name = 'UniRuntimeError';
}
