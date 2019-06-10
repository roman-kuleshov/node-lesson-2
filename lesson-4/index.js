// const fs = require('fs');
const util = require('util');
const { pipeline: defaultPipeline } = require('stream');
const pipeline = util.promisify(defaultPipeline);

const UI = require('./UI');
const Guardian = require('./Guardian');
const AccountManager = require('./AccountManager');

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

async function start() {
  try {
    const result = await pipeline(ui, guardian, manager);

    console.log('Result', result);
  } catch (err) {
    console.log('Error', err);
  }
}

start();
