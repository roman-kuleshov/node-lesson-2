const stringToHex = (str) => Buffer.from(String(str), 'utf8').toString('hex');

const hexToString = (hex) => {
  let str = '';

  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
};

const sum = (a) => {
  return a + a;
};

const multiply = (a) => {
  return a * a;
};

module.exports = {
  stringToHex,
  hexToString,
  sum,
  multiply,
};
