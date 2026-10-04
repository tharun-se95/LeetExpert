const parent = (i) => (i - 1) >> 1;
const left = (i) => 2 * i + 1;
const right = (i) => 2 * i + 2;

module.exports = { parent, left, right };
