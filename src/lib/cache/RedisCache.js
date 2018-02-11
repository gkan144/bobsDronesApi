const redis = require('redis');

function createCache(redisUrl) {
  const redisClient = redis.createClient(redisUrl);
  redisClient.on('error', (error) => { console.error(error); });
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
