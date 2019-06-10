const stringToHex = (str) => Buffer.from(String(str), 'utf8').toString('hex');

module.exports = {
  stringToHex,
};
