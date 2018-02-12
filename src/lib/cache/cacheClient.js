let internalClient = null;

/**
 * Function that injects dependencies and initializes the cache client module.
 * @param {object} implClient: A cache client implementation
 * @returns null
 */
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
  console.log('Initialized cache client.');
}

/**
 * Function that makes sure the cache client module has been initialized. Throws an error if not.
 * @returns null
 */
function validateClient() {
  if (!internalClient) throw new Error('Cache client has not been initialized.');
}
/**
 * Function that checks whether the input key is a string and the
 * input value is a string or a number. Throws an error if not.
 * @param {string} key
 * @param {string | number | undefined} value
 * @returns null
 */
function validateInput(key, value) {
  if (
    (typeof key !== 'string') ||
    ((value !== undefined) && (typeof value !== 'string') && (typeof value !== 'number'))
  ) throw new Error(`Inputs are not strings: ${key} => ${value}, ${typeof key} => ${typeof value}`);
}
/**
 * Function that scans an object's keys and changes their values into Numbers if
 * they can be turned into valid numbers. For example, turns {id: "1"} into {id: 1}
 * @param {object} obj
 * @returns {object}
 */
function stringNumbersToNumbers(obj) {
  return Object.keys(obj).reduce((accObj, key) => ({
    ...accObj,
    [key]: obj[key].trim() !== '' && !Number.isNaN(Number(obj[key])) ?
      Number(obj[key]) :
      obj[key],
  }), {});
}
/**
 * Function that flattens an array of objects into an object. The returned object's
 * keys have the format: ${index-of-object-in-array}.${key-in-object}.
 * For example, the array [{id: 1, name: "George"}, {id: 2, name: "John", surname: "Doe"}]
 * turns into {1.id: 1, 1.name: "George", 2.id: 2, 2.name: "John", 2.surname: "Doe"}
 * @param {object[]} array
 * @returns {object}
 */
function flattenArrayOfObjects(array) {
  return array.reduce((flat, item, index) => ({
    ...flat,
    ...Object.keys(item).reduce((flatItem, key) => ({
      ...flatItem,
      [`${index}.${key}`]: item[key],
    }), {}),
  }), {});
}

/**
 * Function that transforms an flattened array object (see above) into a full array.
 * The input object's keys must follow the format ${index-of-object-in-array}.${key-in-object}.
 * For example, the flattened array
 * {1.id: 1, 1.name: "George", 2.id: 2, 2.name: "John", 2.surname: "Doe"} turns into
 * [{id: 1, name: "George"}, {id: 2, name: "John", surname: "Doe"}]
 * @param {object} flatArray
 * @returns {object[]}
 */
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

/**
 * Get a simple value from the cache.
 * @param {string} key: The key to get from the cache.
 * @returns {Promise<string>}: The value corresponding to the key.
 */
async function get(key) {
  validateClient();
  validateInput(key);
  return internalClient.getAsync(key);
}
/**
 * Set a simple value to the cache.
 * @param {string} key: The key to set in the cache.
 * @param {string} value: The value to set.
 * @returns {Promise<string>}
 */
async function set(key, value) {
  validateClient();
  validateInput(key, value);
  return internalClient.setAsync(key, value);
}

/**
 * Get a flat object from the cache. Changes all values that can be turned into valid
 * numbers into numbers.
 * @param {string} key: The key to get from the cache.
 * @returns {Promise<Object>}: The object corresponding to the key.
 */
async function getObject(key) {
  validateClient();
  validateInput(key);
  const objFromCache = await internalClient.hgetAllAsync(key);
  return objFromCache ? stringNumbersToNumbers(objFromCache) : objFromCache;
}

/**
 * Set a flat object to the cache. The object's value must be simple values
 * and not objects. If any of the values are objects they will be saved in the cache
 * as [object Object].
 * @param {string} key: The key to set in the cache.
 * @param {object} obj: The flat object to set the key's value to.
 * @returns {Promise<string>}
 */
async function setObject(key, obj) {
  validateClient();
  validateInput(key);
  return internalClient.hmsetAsync(key, obj);
}

/**
 * Get an array of objects to the cache after inflating a flattened array object.
 * @param {string} key: The key to get from the cache.
 * @returns {Promise<Object[]>}: The array of objects from the cache.
 */
async function getArrayOfObjects(key) {
  validateClient();
  validateInput(key);
  const flatArrayFromCache = await internalClient.hgetAllAsync(key);
  return inflateArrayOfObjects(flatArrayFromCache);
}

/**
 * Set an array of objects to the cache after flattening it into an object.
 * @param {string} key: The key to set to the cache.
 * @param {object[]} array: The array to set in the cache.
 * @returns {Promise<string>}
 */
async function setArrayOfObjects(key, array) {
  validateClient();
  validateInput(key);
  return internalClient.hmsetAsync(key, flattenArrayOfObjects(array));
}

/**
 * Set the Time To Live of a key in the cache.
 * @param {string} key: The key to set the TTL for.
 * @param {number} time: The time the key is valid for in seconds.
 * @returns {Promise<number>}: 0 if the key does not exist, 1 if the TTL was set.
 */
async function setTTLforKey(key, time) {
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
  setTTLforKey,
};
