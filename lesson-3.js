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
      const targetPerson = this._validateExistingPerson(uuid, 'Withdrawing');

      if (!targetPerson) return;

      if (typeof amount !== 'number' || amount <= 0) {
        this.emit('error', `Withdrawing - the amount is incorrect ${amount}`);
        return;
      }

      if (
        !this._isLimitValid({
          person: targetPerson,
          amount,
          phase: 'Withdrawing',
        })
      ) {
        return;
      }

      if (targetPerson.balance - amount < 0) {
        this.emit(
          'error',
          `Withdrawing - the amount you want to withdraw is more than your have in you account`,
        );
        return;
      }

      this._changeBalance(targetPerson, -amount);
    });

    this.on('send', (fromUuid, toUuid, amount) => {
      const fromPerson = this._validateExistingPerson(fromUuid, 'Sending money');
      const toPerson = this._validateExistingPerson(toUuid, 'Retrieving money');

      if (!fromPerson || !toPerson) return;

      if (typeof amount !== 'number' || amount <= 0) {
        this.emit('error', `Sending - the amount is incorrect ${amount}`);
        return;
      }

      if (fromPerson.balance - amount < 0) {
        this.emit('error', `Sending - you don't have enough money on your account`);
        return;
      }

      if (
        !this._isLimitValid({
          person: fromPerson,
          amount,
          phase: 'Sending',
        })
      ) {
        return;
      }

      this.persons = {
        ...this.persons,
        [fromUuid]: {
          ...fromPerson,
          balance: fromPerson.balance - amount,
        },
        [toUuid]: {
          ...toPerson,
          balance: toPerson.balance + amount,
        },
      };
    });

    this.on('changeLimit', (uuid, limit) => {
      const targetPerson = this._validateExistingPerson(uuid, 'Changing limit');

      if (!targetPerson) return;

      this.persons = {
        ...this.persons,
        [uuid]: {
          ...targetPerson,
          limit,
        },
      };
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

  _isLimitValid({ person, amount, phase }) {
    let isValid = true;
    const updatedBalance = person.balance - amount;

    if (person.limit && !person.limit(amount, person.balance, updatedBalance)) {
      this.emit('error', `${phase} - limit error`);
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
  balance: 600,
  limit: (amount) => amount <= 50,
});

const personTwoId = bank.register({
  name: 'Jon Snow',
  balance: 500,
});

bank.emit('get', personOneId, (balance) => {
  console.log(`I have $${balance}`);
});
bank.emit('get', personTwoId, (balance) => {
  console.log(`I have $${balance}`);
});

bank.emit('add', personOneId, 50);
bank.emit('withdraw', personOneId, 30);
bank.emit('add', personTwoId, 100);
bank.emit('withdraw', personTwoId, 20);

bank.emit('send', personOneId, personTwoId, 30);

bank.emit('changeLimit', personOneId, (amount, currentBalance, updatedBalance) => {
  return amount < 150 && updatedBalance > 400 && currentBalance > 500;
});

bank.emit('send', personOneId, personTwoId, 100);

console.log('persons', bank.persons);
