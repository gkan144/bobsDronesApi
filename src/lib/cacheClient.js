const redis = require('redis');

let internalClient = null;

function initialize() {
  console.log('Initializing cache');
  const tempClient = redis.createClient(process.env.REDIS_URL);
  internalClient = {
    ...tempClient,
    getAsync: (...args) => new Promise((resolve, reject) => {
      tempClient.get(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
    setAsync: (...args) => new Promise((resolve, reject) => {
      tempClient.set(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
  };
}

function get(...args) {
  console.log('Get from cache');
  if (internalClient) return internalClient.getAsync(...args);
  throw new Error('Cache client has not been initialized.');
}

function set(...args) {
  console.log('Set to cache');
  if (internalClient) return internalClient.setAsync(...args);
  throw new Error('Cache client has not been initialized.');
}

module.exports = {
  internalClient,
  initialize,
  get,
  set,
};
