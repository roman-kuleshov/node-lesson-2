const { Readable } = require('stream');

class UI extends Readable {
  constructor(data, options = {}) {
    super(options);

    this.data = data;
  }

  _read(size) {
    let chunk = this.data.shift();

    if (!chunk) {
      this.push(null);
    } else {
      this._validate(chunk);
      this.push(chunk);
    }
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
}

module.exports = UI;
