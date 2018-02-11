const baseUrl = 'https://bobs-epic-drone-shack-inc.herokuapp.com';
const baseApi = 'api/v0';
const getAllKey = 'drones';
const keyTTL = 86400;

let internalCacheClient = null;
let internalRequestHandler = null;

/**
 * Function that injects dependencies and initializes the api client module.
 * @param {object} cacheClient: A cache client object.
 * @param {object} requestHandler: A request handler object
 */
function initialize(cacheClient, requestHandler) {
  if (
    cacheClient &&
    cacheClient.getObject &&
    cacheClient.setObject &&
    cacheClient.getArrayOfObjects &&
    cacheClient.setArrayOfObjects &&
    cacheClient.setTTLforKey
  ) {
    internalCacheClient = cacheClient;
  } else throw new Error('Supplied cache client is invalid');

  if (requestHandler.sendUnreliable) {
    internalRequestHandler = requestHandler;
  } else throw new Error('Supplied request handler is invalid');
  console.log('Initialized api client.');
}

/**
 * Function that makes sure the api client module has been initialized. Throws an error if not.
 */
function validateClient() {
  if (!internalCacheClient && internalRequestHandler) throw new Error('Api client not configured properly.');
}

/**
 * Async function that updates the cache in parallel. Makes one update for the drones (getAll) key,
 * and individual updates for each droneId key (getById).
 * @param {Object[]} drones
 * @returns {Promise<void>}
 */
async function updateCacheWithDrones(drones) {
  await Promise.all([
    internalCacheClient.setArrayOfObjects(getAllKey, drones),
    internalCacheClient.setTTLforKey(getAllKey, keyTTL),
    ...drones.reduce((promiseAcc, drone) => promiseAcc.concat(
      internalCacheClient.setObject(`drone-${drone.droneId}`, drone),
      internalCacheClient.setTTLforKey(`drone-${drone.droneId}`, keyTTL),
    ), []),
  ]);
  console.log('Updated cache with new drones info.');
}

/**
 * Async functions used to initialize the cache's values during start up.
 * @returns {Promise<boolean>}
 */
async function initializeCacheValues() {
  console.log('Initializing cache\'s values.');
  validateClient();
  const url = `${baseUrl}/${baseApi}/drones`;
  const response = await internalRequestHandler.sendUnreliable(url);
  if (response.ok) {
    console.log('Received drones info from api.');
    await updateCacheWithDrones(await response.json());
  }
  return !!response.ok;
}

/**
 * Async function that pulls all the drone's info either from the backend api or the cache.
 * First, it attempts to recover the drone data from the api.
 * If it successful it updates the cache with the new values and returns the data.
 * If not it attempts to pull the data from the cache.
 * @returns {Promise<{fromCache: boolean, drones: Object[]}>}
 */
async function getAllDrones() {
  validateClient();
  let drones = null;
  let fromCache = false;
  const url = `${baseUrl}/${baseApi}/drones`;
  const response = await internalRequestHandler.sendUnreliable(url);
  if (response.ok) {
    console.log('Received drones info from api.');
    drones = await response.json();
    await updateCacheWithDrones(drones);
  } else {
    console.log('Did not receive drones info from api. Attempting cache.');
    fromCache = true;
    drones = await internalCacheClient.getArrayOfObjects(getAllKey);
  }
  return {
    fromCache,
    drones,
  };
}

/**
 * Async function that pulls a single drone's info either from the backend api or the cache.
 * First, it attempts to recover the drone's data from the api.
 * If it successful it updates the cache with the new value for that drone and returns the data.
 * If not it attempts to pull the data from the cache.
 * @param {number} droneId
 * @returns {Promise<*>}
 */
async function getDroneById(droneId) {
  validateClient();
  if (!Number.isNaN(droneId)) {
    let drone = null;
    let fromCache = false;
    const url = `${baseUrl}/${baseApi}/drones/${droneId}`;
    const response = await internalRequestHandler.sendUnreliable(url);
    if (response.ok) {
      console.log(`Received drone ${droneId} info from api.`);
      drone = await response.json();
      await internalCacheClient.setObject(`drone-${drone.droneId}`, drone);
      console.log(`Updated cache with new drone ${droneId} info.`);
    } else {
      console.log(`Did not receive drone ${droneId} info from api. Attempting cache.`);
      fromCache = true;
      drone = await internalCacheClient.getObject(`drone-${droneId}`);
    }
    return {
      fromCache,
      drone,
    };
  }
  return {
    errorCode: 400,
    errorMessage: `Invalid id: ${droneId} provided`,
  };
}

module.exports = {
  initialize,
  initializeCacheValues,
  getAllDrones,
  getDroneById,
};
