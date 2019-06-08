const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');

class Bank extends EventEmitter {
  constructor() {
    super();
    this.persons = {};

    this._setListeners();
  }

  register(person) {
    const uuid = uuidv1();
    const isPersonValid = this._validateNewPerson(person);

    if (!isPersonValid) {
      return null;
    }

    this.persons = {
      ...this.persons,
      [uuid]: {
        ...person,
        uuid,
      },
    };

    return uuid;
  }

  _setListeners() {
    this.on('add', (uuid, amount) => {
      const targetPerson = this._validateExistingPerson(uuid, 'Increasing balance');

      if (!targetPerson) return;

      if (typeof amount !== 'number' || amount <= 0) {
        this.emit('error', `Increasing balance - the amount is incorrect ${amount}`);
        return;
      }

      this._changeBalance(targetPerson, amount);
    });

    this.on('get', (uuid, callback) => {
      const targetPerson = this._validateExistingPerson(uuid, 'Getting balance');

      if (!targetPerson) return;

      callback(targetPerson.balance);
    });

    this.on('withdraw', (uuid, amount) => {
      const targetPerson = this._validateExistingPerson(uuid, 'Decreasing balance');

      if (!targetPerson) return;

      if (typeof amount !== 'number' || amount <= 0) {
        this.emit('error', `Decreasing balance - the amount is incorrect ${amount}`);
        return;
      }

      if (targetPerson.balance - amount < 0) {
        this.emit(
          'error',
          `Decreasing balance - the amount you want to decrease is more than your have in you account`,
        );
        return;
      }

      this._changeBalance(targetPerson, -amount);
    });
  }

  _changeBalance(targetPerson, amount) {
    this.persons = {
      ...this.persons,
      [targetPerson.uuid]: {
        ...targetPerson,
        balance: targetPerson.balance + amount,
      },
    };
  }

  _validateNewPerson(person) {
    let isValid = true;

    if (Object.values(this.persons).find(({ name }) => name === person.name)) {
      this.emit(
        'error',
        'A person with this name is already registered. Please pick another name.',
      );

      isValid = false;
    }

    if (typeof person.balance !== 'number' || person.balance <= 0) {
      this.emit('error', 'Please set a valid balance.');

      isValid = false;
    }

    return isValid;
  }

  _validateExistingPerson(uuid, where) {
    const person = this.persons[uuid];

    if (person) {
      return person;
    }

    this.emit('error', `${where}: the person doesn't exist`);
    return null;
  }
}

const bank = new Bank();

bank.on('error', (error) => {
  console.log(`Error: ${error}`);
});

const personOneId = bank.register({
  name: 'Pitter Black',
  balance: 100,
});

const personTwoId = bank.register({
  name: 'Jon Snow',
  balance: 500,
});

bank.emit('add', personOneId, 50);
bank.emit('withdraw', personOneId, 10);
bank.emit('add', personTwoId, 100);
bank.emit('withdraw', personTwoId, 20);

bank.emit('get', personOneId, (balance) => {
  console.log(`I have $${balance}`);
});
bank.emit('get', personTwoId, (balance) => {
  console.log(`I have $${balance}`);
});

console.log('persons', bank.persons);
