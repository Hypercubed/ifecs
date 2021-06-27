// TODO: need to store times?
export class History {
  private _historySize = Infinity;
  private _history: string[] = [];
  private _saves: string[][] = [];
  private _position = -1;

  get history() {
    return this._history.slice().reverse();
  }

  get position() {
    return this._position;
  }

  resetPosition() {
    this._position = -1;
  }

  add(line: string) {
    this._history.unshift(line);
    while (this._history.length > this._historySize) {
      this._history.pop();
    }
  }

  clear() {
    this._history.splice(0, Infinity);
  }

  save() {
    this._saves.push(this._history.filter((l) => !l.startsWith(".")));
  }

  restore() {
    if (this._saves.length) {
      this._history = this._saves.pop()!;
    }
  }

  undo() {
    this._history.shift();
  }

  prev() {
    if (this._position < this._history.length - 1) {
      this._position++;
    }
    return this._history[this._position];
  }

  next() {
    if (this._position > -1) {
      this._position--;
    }
    return this._history[this._position];
  }
}
