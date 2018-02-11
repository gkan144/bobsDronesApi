/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const fetch = require('node-fetch');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const requestHandler = require('../../../src/lib/api/requestHandler');

chai.use(sinonChai);
const should = chai.should();

describe('requesthandler', function () {
  it('should exist', function () {
    should.exist(requestHandler);
  });
  describe('http client handling', function () {
    it('should have a getter and setter for the http client', function () {
      should.exist(requestHandler.getHttpClient);
      should.exist(requestHandler.setHttpClient);
    });
    it('should be initialized with the node-fetch client', function () {
      requestHandler.getHttpClient().should.be.equal(fetch);
    });
    it('should update requestHandler with the value passed', function () {
      const testClient = {};
      requestHandler.setHttpClient(testClient);
      requestHandler.getHttpClient().should.be.equal(testClient);
    });
    it('should throw if null or undefined is passed into the setter', function () {
      should.Throw(function setTest() { requestHandler.setHttpClient(null); });
      should.Throw(function getTest() { requestHandler.setHttpClient(undefined); });
    });
  });
  describe('requestHandler.send', function () {
    it('should exist', function () {
      should.exist(requestHandler.send);
    });
    it('should call the http client with only the passed in arguments', function () {
      const spy = sinon.spy();
      const testUrl = 'test-url';
      const testOptions = { a: 'test' };
      requestHandler.setHttpClient(spy);
      requestHandler.send(testUrl, testOptions);
      spy.should.have.been.calledWithExactly(testUrl, testOptions);
    });
    it('should return with a promise created by the http client', async function () {
      const fakeResponse = { a: 'test' };
      const stub = sinon.stub().resolves(fakeResponse);
      requestHandler.setHttpClient(stub);
      const response = await requestHandler.send();
      response.should.be.equal(fakeResponse);
    });
  });
  describe('requestHandler.sendUnreliable', function () {
    it('should exist', function () {
      should.exist(requestHandler.sendUnreliable);
    });
    it('should call the http client with the passed in arguments', function () {
      const stub = sinon.stub().resolves({ ok: false });
      const testUrl = 'test-url';
      const testOptions = { a: 'test' };
      requestHandler.setHttpClient(stub);
      requestHandler.sendUnreliable(testUrl, testOptions);
      stub.should.have.been.calledWithExactly(testUrl, testOptions);
    });
    it('should call the http client 5 times by default if it does not receive an ok response', async function () {
      const stub = sinon.stub().resolves({ ok: false });
      requestHandler.setHttpClient(stub);
      await requestHandler.sendUnreliable();
      stub.should.have.callCount(5);
    });
    it('should call the http client maxTries times if it does not receive an ok response', async function () {
      const maxTries = 3;
      const stub = sinon.stub().resolves({ ok: false });
      requestHandler.setHttpClient(stub);
      await requestHandler.sendUnreliable(null, null, maxTries);
      stub.should.have.callCount(maxTries);
    });
    it('should resolve if it receives an ok response before maxTries', async function() {
      const maxTries = 3;
      const correctCall = 2;
      const stub = sinon.stub().resolves({ ok: false });
      stub.onCall(correctCall - 1).resolves({ ok: true });
      requestHandler.setHttpClient(stub);
      await requestHandler.sendUnreliable(null, null, maxTries);
      stub.should.have.callCount(correctCall);
    });
  });
});
