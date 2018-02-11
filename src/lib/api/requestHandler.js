const fetch = require('node-fetch');

let httpClient = fetch;
/**
 * Wrapper object for a fetch api compatible library. Provides methods for making HTTP requests
 * against an unreliable api.
 * @type {
 *   {
 *     send: function(string, object): Promise<object>,
 *     sendUnreliable: function(string, object, number),
 *     setHttpClient: function(object)
 *   }
 * }
 */
const requestHandler = {
  /**
   * Set the client object used to make the HTTP requests
   * @param {object} newClient: A fetch api compatible client
   */
  setHttpClient: (newClient) => {
    if (newClient !== null && newClient !== undefined) httpClient = newClient;
    else throw new Error('Attempted to set client to null or undefined');
  },
  /**
   * Get the http client currently used.
   * @returns {object}
   */
  getHttpClient: () => httpClient,
  /**
   * Make a single request against a url.
   * @param {string} url
   * @param {object} options: fetch api options object
   * @returns {Promise<*>}
   */
  send: (url, options) => httpClient(url, options),
  /**
   * Make a request against a url. If the server responds with an error code then retry
   * the request up to maxRetries times.
   * @param {string} url
   * @param {object} options: fetch api options object
   * @param {number} maxRetries: the maximum number of times a request should be repeated.
   * @returns {Promise<*>}
   */
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
};

module.exports = requestHandler;
