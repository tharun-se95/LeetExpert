function address(base, slotSize, i) {
  return base + i * slotSize;
}

function insertFront(store, length, value) {
  for (let j = length; j > 0; j--) store[j] = store[j - 1];
  store[0] = value;
}

module.exports = { address, insertFront };
