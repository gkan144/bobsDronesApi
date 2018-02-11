const fetch = require('node-fetch');

let httpClient = fetch;

const requestHandler = {
  send: (url, options) => httpClient(url, options),
  sendUnreliable: async (url, options, maxRetries = 5) => {
    let currentRetries = 0;
    while (currentRetries < maxRetries) {
      console.log(`Request to ${url}. attempt: ${currentRetries}`);
      // eslint-disable-next-line no-await-in-loop
      const response = await httpClient(url, options);
      if (response.ok || currentRetries === maxRetries - 1) {
        if (currentRetries !== maxRetries - 1) console.log('Response is ok');
        else console.log('Response not ok but reached max retries');
        return response;
      }
      console.log(`Response not ok: ${response.status} ${response.statusText}`);
      currentRetries += 1;
    }
    return null;
  },
  setHttpClient: (newClient) => { httpClient = newClient; },
};

module.exports = requestHandler;
