const EventEmitter = require('events');

class DB extends EventEmitter {
  constructor() {
    super();
    this.data = [];

    this._setListeners();
  }

  _setListeners() {
    this.on('add', (log) => (this.data = [...this.data, log]));
  }
}

module.exports = DB;
