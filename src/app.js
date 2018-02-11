const express = require('express');

const cache = require('./lib/cache/cacheClient');
const redis = require('./lib/cache/RedisCache');
const requestHandler = require('./lib/api/requestHandler');
const apiClient = require('./lib/api/apiClient');
const routes = require('./routes/index');

const app = express();
cache.initialize(redis.createCache(process.env.REDIS_URL));
apiClient.initialize(cache, requestHandler);

apiClient.initializeCacheValues()
  .then((isCacheInitialized) => {
    if (!isCacheInitialized) {
      console.log('Cache has not been initialized with Bob\'s drones.');
    }

    app.use('/api/v0', routes);

    app.listen(process.env.PORT, () => {
      console.log(`Bob's drones proxy listening on port ${process.env.PORT}!`);
    });
  }).catch((error) => {
    console.error(error);
  });
