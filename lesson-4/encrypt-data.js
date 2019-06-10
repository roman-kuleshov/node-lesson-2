const { pipeline: defaultPipeline } = require('stream');
const util = require('util');
const pipeline = util.promisify(defaultPipeline);

const UI = require('./modules/UI');
const Guardian = require('./modules/Guardian');
const AccountManager = require('./modules/AccountManager');
const Logger = require('./modules/Logger');
const DB = require('./modules/DB');

const customers = [
  {
    name: 'Pitter Black',
    email: 'pblack@email.com',
    password: 'pblack_123',
  },
  {
    name: 'Oliver White',
    email: 'owhite@email.com',
    password: 'owhite_456',
  },
  {
    name: 'John Show',
    email: 'johnShow@email.com',
    password: 'johnShow_777',
  },
];
const options = {
  objectMode: true,
};

const ui = new UI(customers, options);
const guardian = new Guardian(options);
const manager = new AccountManager(options);
const db = new DB();
const logger = new Logger(options, db);

async function start() {
  try {
    const result = await pipeline(ui, guardian, logger, manager);

    console.log('Result', result);
    console.log('DB', db.data);
  } catch (err) {
    console.log('Error', err);
  }
}

start();
