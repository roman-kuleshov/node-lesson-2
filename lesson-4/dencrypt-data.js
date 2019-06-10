const { pipeline: defaultPipeline } = require('stream');
const util = require('util');
const pipeline = util.promisify(defaultPipeline);

const UI = require('./modules/UI');
const { Decryptor, algorithm: DecryptorAlgorithm } = require('./modules/Decryptor');
const AccountManager = require('./modules/AccountManager');

const customers = [
  {
    payload: {
      name: 'Pitter Black',
      email: '70626c61636b40656d61696c2e636f6d',
      password: '70626c61636b5f313233',
    },
    meta: {
      algorithm: 'hex',
    },
  },
];
const options = {
  objectMode: true,
};

const ui = new UI(customers, options);
const decryptor = new Decryptor({ options, algorithm: DecryptorAlgorithm.hex });
const manager = new AccountManager(options);

async function start() {
  try {
    const result = await pipeline(ui, decryptor, manager);

    console.log('Result', result);
  } catch (err) {
    console.log('Error', err);
  }
}

start();
