const express = require('express');

const cache = require('./lib/cacheClient');

const app = express();

cache.initialize();

app.get('/', async (req, res) => {
  console.log('Received request');

  try {
    await cache.set('test', 'value');
    const test = await cache.get('test');
    res.send(`Hello world. Test is ${test}`);
  } catch (error) {
    console.error(error);
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
