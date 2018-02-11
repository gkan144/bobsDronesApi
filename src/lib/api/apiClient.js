const baseUrl = 'https://bobs-epic-drone-shack-inc.herokuapp.com';
const baseApi = 'api/v0';
const getAllKey = 'drones';
const keyTTL = 86400;

let internalCacheClient = null;
let internalRequestHandler = null;

function initialize(cacheClient, requestHandler) {
  if (
    cacheClient &&
    cacheClient.getObject &&
    cacheClient.setObject &&
    cacheClient.getArrayOfObjects &&
    cacheClient.setArrayOfObjects &&
    cacheClient.expire
  ) {
    internalCacheClient = cacheClient;
  } else throw new Error('Supplied cache client is invalid');

  if (requestHandler.sendUnreliable) {
    internalRequestHandler = requestHandler;
  } else throw new Error('Supplied request handler is invalid');
}

function validateClient() {
  if (!internalCacheClient && internalRequestHandler) throw new Error('Api client not configured properly.');
}

async function updateCacheWithDrones(drones) {
  await Promise.all([
    internalCacheClient.setArrayOfObjects(getAllKey, drones),
    internalCacheClient.expire(getAllKey, keyTTL),
    ...drones.reduce((promiseAcc, drone) => promiseAcc.concat(
      internalCacheClient.setObject(`drone-${drone.droneId}`, drone),
      internalCacheClient.expire(`drone-${drone.droneId}`, keyTTL),
    ), []),
  ]);
}

async function initializeCacheValues() {
  validateClient();
  const url = `${baseUrl}/${baseApi}/drones`;
  const response = await internalRequestHandler.sendUnreliable(url);
  if (response.ok) {
    await updateCacheWithDrones(await response.json());
  }
  return response.ok;
}

async function getAllDrones() {
  validateClient();
  let drones = null;
  let fromCache = false;
  const url = `${baseUrl}/${baseApi}/drones`;
  const response = await internalRequestHandler.sendUnreliable(url);
  if (response.ok) {
    drones = await response.json();
    await updateCacheWithDrones(drones);
  } else {
    fromCache = true;
    drones = await internalCacheClient.getArrayOfObjects(getAllKey);
  }
  return {
    fromCache,
    drones,
  };
}

async function getDroneById(droneId) {
  validateClient();
  if (!Number.isNaN(droneId)) {
    let drone = null;
    let fromCache = false;
    const url = `${baseUrl}/${baseApi}/drones/${droneId}`;
    const response = await internalRequestHandler.sendUnreliable(url);
    if (response.ok) {
      drone = await response.json();
      await internalCacheClient.setObject(`drone-${drone.droneId}`, drone);
    } else {
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
    errorMessage: 'Invalid id provided',
  };
}

module.exports = {
  initialize,
  initializeCacheValues,
  getAllDrones,
  getDroneById,
};
