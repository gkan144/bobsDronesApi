const express = require('express');
const redis = require('redis');

const app = express();
const client = redis.createClient(process.env.REDIS_URL);

app.get('/', (req, res) => {
  console.log('Received request');
  client.set('foo', 'bar');
  client.get('foo', (err, data) => {
    res.send(`Hello World! ${data}`);
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
