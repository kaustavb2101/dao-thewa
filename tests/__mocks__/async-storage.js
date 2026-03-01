const storage = {};
const AsyncStorage = {
  getItem:    jest.fn(async (k) => storage[k] ?? null),
  setItem:    jest.fn(async (k, v) => { storage[k] = v; }),
  removeItem: jest.fn(async (k) => { delete storage[k]; }),
  clear:      jest.fn(async () => { Object.keys(storage).forEach(k => delete storage[k]); }),
  getAllKeys: jest.fn(async () => Object.keys(storage)),
};
module.exports = { default: AsyncStorage, ...AsyncStorage };
