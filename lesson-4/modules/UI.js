const { Readable } = require('stream');

class UI extends Readable {
  constructor(data, options = {}) {
    super(options);

    this.data = data;
  }

  _read() {
    let chunk = this.data.shift();

    if (!chunk) {
      this.push(null);
    } else {
      this.push(chunk);
    }
  }
}

module.exports = UI;
