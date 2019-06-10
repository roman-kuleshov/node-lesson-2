const { Transform } = require('stream');
const { stringToHex } = require('../utils');

class Guardian extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, done) {
    this._validate(chunk);

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

    this.push(updatedChunk);
    done();
  }

  _validate(chunk) {
    const AllFieldsRequired =
      Object.keys(chunk).length === 3 && 'name' in chunk && 'email' in chunk && 'password' in chunk
        ? {
            valid: true,
          }
        : {
            error: 'Invalid schema.',
          };
    const AllFieldsString =
      typeof chunk.name === 'string' &&
      typeof chunk.email === 'string' &&
      typeof chunk.password === 'string'
        ? {
            valid: true,
          }
        : {
            error: 'Invalid data type. All fields should be string.',
          };

    if (!(AllFieldsRequired.valid && AllFieldsString.valid)) {
      this.emit(
        'error',
        [AllFieldsRequired, AllFieldsString].filter(({ error }) => Boolean(error)),
      );
    }
  }

  _flush(done) {
    done();
  }
}

module.exports = Guardian;
