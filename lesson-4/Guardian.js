const { Transform } = require('stream');
const { stringToHex } = require('./utils');

class Guardian extends Transform {
  constructor(options = {}) {
    super(options);

    this.init();
  }

  init() {}

  _transform(chunk, encoding, done) {
    const updatedChunk = {
      meta: {
        source: 'ui',
      },
      payload: {
        ...chunk,
        email: stringToHex(chunk.email),
        password: stringToHex(chunk.password),
      },
    };

    console.log(updatedChunk);
    this.push(updatedChunk);
    done();
  }

  _flush(done) {
    done();
  }
}

module.exports = Guardian;
