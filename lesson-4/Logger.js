const { Transform } = require('stream');

class Logger extends Transform {
  constructor(options = {}, db) {
    super(options);
    this.db = db;
  }

  _transform(chunk, encoding, done) {
    const log = {
      source: chunk.meta.source,
      payload: chunk.payload,
      created: new Date(),
    };

    this.push(chunk);
    this.db.emit('add', log);
    done();
  }

  _flush(done) {
    done();
  }
}

module.exports = Logger;
