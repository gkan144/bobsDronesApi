const redis = require('redis');

/**
 * Function that initializes the redis client library and enhances it with
 * promisified methods for basic operations.
 * @param redisUrl
 * @returns {{
 *     getAsync: function(...[*]): Promise<any>,
 *     setAsync: function(...[*]): Promise<any>,
 *     hgetAllAsync: function(...[*]): Promise<any>,
 *     hmsetAsync: function(...[*]): Promise<any>,
 *     expireAsync: function(...[*]): Promise<any>
 * }}
 */
function createCache(redisUrl) {
  const redisClient = redis.createClient(redisUrl);
  redisClient.on('error', (error) => { console.error(error); });
  console.log('Initialized redis client.');
  return {
    ...redisClient,
    getAsync: (...args) => new Promise((resolve, reject) => {
      redisClient.get(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
    setAsync: (...args) => new Promise((resolve, reject) => {
      redisClient.set(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
    hgetAllAsync: (...args) => new Promise((resolve, reject) => {
      redisClient.hgetall(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
    hmsetAsync: (...args) => new Promise((resolve, reject) => {
      redisClient.hmset(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
    expireAsync: (...args) => new Promise((resolve, reject) => {
      redisClient.expire(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }),
  };
}

module.exports = {
  createCache,
};
