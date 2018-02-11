
let internalClient = null;

function initialize(implClient) {
  if (
    implClient &&
    implClient.getAsync &&
    implClient.setAsync &&
    implClient.hgetAllAsync &&
    implClient.hmsetAsync &&
    implClient.expireAsync
  ) {
    internalClient = implClient;
  } else throw new Error('Supplied cache client is invalid');
}

function validateClient() {
  if (!internalClient) throw new Error('Cache client has not been initialized.');
}
function validateInput(...args) {
  if (args.findIndex(argument => (typeof argument !== 'string') || (typeof argument !== 'number'))) throw new Error(`Inputs are not strings: ${args}`);
}

function stringNumbersToNumbers(obj) {
  return Object.keys(obj).reduce((accObj, key) => ({
    ...accObj,
    [key]: obj[key].trim() !== '' && !Number.isNaN(Number(obj[key])) ?
      Number(obj[key]) :
      obj[key],
  }), {});
}
function flattenArrayOfObjects(array) {
  return array.reduce((flat, item, index) => ({
    ...flat,
    ...Object.keys(item).reduce((flatItem, key) => ({
      ...flatItem,
      [`${index}.${key}`]: item[key],
    }), {}),
  }), {});
}
function inflateArrayOfObjects(flatArray) {
  return Object.keys(flatArray).reduce((accArray, key) => {
    const [index, objKey] = key.split('.');
    return [
      ...accArray.slice(0, Number(index)),
      {
        ...accArray[Number(index)],
        [objKey]: flatArray[key].trim() !== '' && !Number.isNaN(Number(flatArray[key])) ?
          Number(flatArray[key]) :
          flatArray[key],
      },
      ...accArray.slice(Number(index) + 1),
    ];
  }, []);
}

async function get(key) {
  validateClient();
  validateInput(key);
  return internalClient.getAsync(key);
}
async function set(key, value) {
  validateClient();
  validateInput(key, value);
  return internalClient.setAsync(key, value);
}
async function getObject(key) {
  validateClient();
  validateInput(key);
  const objFromCache = await internalClient.hgetAllAsync(key);
  return stringNumbersToNumbers(objFromCache);
}
async function setObject(key, obj) {
  validateClient();
  validateInput(key);
  return internalClient.hmsetAsync(key, obj);
}
async function getArrayOfObjects(key) {
  validateClient();
  validateInput(key);
  const arrayFromCache = await internalClient.hgetAllAsync(key);
  return inflateArrayOfObjects(arrayFromCache);
}
async function setArrayOfObjects(key, array) {
  validateClient();
  validateInput(key);
  return internalClient.hmsetAsync(key, flattenArrayOfObjects(array));
}
async function expire(key, time) {
  validateClient();
  validateInput(key);
  return internalClient.expireAsync(key, time);
}

module.exports = {
  initialize,
  get,
  set,
  getObject,
  setObject,
  getArrayOfObjects,
  setArrayOfObjects,
  expire,
};
