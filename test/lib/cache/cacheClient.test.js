/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const cacheClient = require('../../../src/lib/cache/cacheClient');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const should = chai.should();

const testClient = {
  getAsync: () => {},
  setAsync: () => {},
  hgetAllAsync: () => {},
  hmsetAsync: () => {},
  expireAsync: () => {},
};

describe('cacheClient', function () {
  const cache = {
    key1: 'value1',
    key2: 'value2',
    key4: { key41: 'value41', key42: 'value42' },
    key5: { key51: 'value41', key52: 'value42' },
    key7: {
      '1.key1': 'value61', '1.key2': 'value62', '2.key1': 'value61', '2.key2': 'value62',
    },
    key8: {
      '1.key1': 'value61', '1.key2': 'value62', '2.key1': 'value61', '2.key2': 'value62',
    },
  };
  const stubGet = sinon.stub().callsFake(function fake(key) {
    return Promise.resolve(cache[key] ? cache[key] : null);
  });
  const stubSet = sinon.stub().callsFake(function fake(key, value) {
    cache[key] = value;
    return Promise.resolve('OK');
  });
  it('should exist', function () {
    should.exist(cacheClient);
  });
  describe('cacheClient.initialize', function () {
    it('should accept a valid client', function () {
      should.not.Throw(function () { cacheClient.initialize(testClient); });
    });
    it('should throw if called with an invalid or null/undefined client', function () {
      const localTestClient = {
        ...testClient,
        getAsync: undefined,
        setAsync: undefined,
      };
      should.Throw(function invalidClient() { cacheClient.initialize(localTestClient); });
      should.Throw(function nullClient() { cacheClient.initialize(null); });
      should.Throw(function undefinedClient() { cacheClient.initialize(undefined); });
    });
  });
  describe('cacheClient.get', function () {
    before('create mock cache client.', function () {
      const localTestClient = {
        ...testClient,
        getAsync: stubGet,
      };
      cacheClient.initialize(localTestClient);
    });
    afterEach('reset stub', function () {
      stubGet.resetHistory();
    });
    it('should exist', function () {
      should.exist(cacheClient.get);
    });
    it('should call the cache client library with the input key', async function () {
      const testKey = 'key';
      await cacheClient.get(testKey);
      stubGet.should.have.been.calledWithExactly(testKey);
    });
    it('should return the value stored in the cache', async function () {
      const testKey = 'key1';
      const value = await cacheClient.get(testKey);
      value.should.be.equal(cache[testKey]);
    });
  });
  describe('cacheClient.set', function () {
    before('create mock cache client.', function () {
      const localTestClient = {
        ...testClient,
        setAsync: stubSet,
      };
      cacheClient.initialize(localTestClient);
    });
    afterEach('reset stub', function () {
      stubSet.resetHistory();
    });
    it('should exist', function () {
      should.exist(cacheClient.set);
    });
    it('should call the cache client library with the input key and value', async function () {
      const testKey = 'key2';
      const testValue = cache[testKey];
      await cacheClient.set(testKey, testValue);
      stubSet.should.have.been.calledWith(testKey, testValue);
    });
    it('should update a key\'s value if it exists', async function () {
      const testKey = 'key2';
      const testValue = `${cache[testKey]}-updated`;
      await cacheClient.set(testKey, testValue);
      cache[testKey].should.be.equal(testValue);
    });
    it('should create a key\'s value if it does not exist', async function () {
      const testKey = 'key3';
      const testValue = 'key3-created';
      await cacheClient.set(testKey, testValue);
      cache[testKey].should.be.equal(testValue);
    });
    it('should throw if it receives null key or value', function () {
      const testKey = null;
      const testValue = null;
      const promise = cacheClient.set(testKey, testValue);
      return promise.should.be.rejected;
    });
    it('should throw if it receives number key', function () {
      const testKey = 1;
      const testValue = 'testValue';
      const promise = cacheClient.set(testKey, testValue);
      return promise.should.be.rejected;
    });
    it('should throw if it receives object key', function () {
      const testKey = { test: 1 };
      const testValue = 'test';
      const promise = cacheClient.set(testKey, testValue);
      return promise.should.be.rejected;
    });
    it('should throw if it receives object value', function () {
      const testKey = 'test-key';
      const testValue = { test: 1 };
      const promise = cacheClient.set(testKey, testValue);
      return promise.should.be.rejected;
    });
  });
  // TODO complete tests for cacheClient
});
