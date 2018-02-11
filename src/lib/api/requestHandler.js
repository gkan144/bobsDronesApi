const fetch = require('node-fetch');

let httpClient = fetch;

const requestHandler = {
  send: (url, options) => httpClient(url, options),
  sendUnreliable: async (url, options, maxRetries = 5) => {
    let currentRetries = 0;
    while (currentRetries < maxRetries) {
      // eslint-disable-next-line no-await-in-loop
      const response = await httpClient(url, options);
      if (response.ok || currentRetries === maxRetries - 1) {
        return response;
      }
      currentRetries += 1;
    }
    return null;
  },
  setHttpClient: (newClient) => { httpClient = newClient; },
};

module.exports = requestHandler;
