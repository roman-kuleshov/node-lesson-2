const { Writable } = require('stream');

class AccountManager extends Writable {
  constructor(options = {}) {
    super(options);
  }

  _write(chunk, encoding, done) {
    done();
  }
}

module.exports = AccountManager;
