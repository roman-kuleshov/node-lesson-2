const { Transform } = require('stream');
const { hexToString } = require('../utils');

const algorithm = {
  hex: 'hex',
  base64: 'base64',
};

class Decryptor extends Transform {
  constructor({ options, algorithm }) {
    super(options);

    this.algorithm = algorithm;
  }

  _transform(chunk, encoding, done) {
    this._validate(chunk);

    let updatedChunk = {};

    if (this.algorithm === algorithm.hex) {
      const { name, email, password } = chunk.payload;

      updatedChunk = {
        name,
        email: hexToString(email),
        password: hexToString(password),
      };
    } else if (this.algorithm === algorithm.base64) {
      // todo: implement this later
    }

    this.push(updatedChunk);
    done();
  }

  _validate(chunk) {
    // todo: implement this later
  }

  _flush(done) {
    done();
  }
}

module.exports = { Decryptor, algorithm };
