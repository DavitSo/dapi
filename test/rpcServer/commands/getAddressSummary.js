const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sion = require('sinon');
const getAddressSummaryFactory = require('../../../lib/rpcServer/commands/getAddressSummary');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const { expect } = chai;
chai.use(chaiAsPromised);
const spy = sion.spy(coreAPIFixture, 'getAddressSummary');

describe('getAddressSummary', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getAddressSummary = getAddressSummaryFactory(coreAPIFixture);
      expect(getAddressSummary).to.be.a('function');
    });
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return an object', async () => {
    const getAddressSummary = getAddressSummaryFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    let summary = await getAddressSummary(['XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w']);
    expect(summary).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);
    summary = await getAddressSummary({ address: 'XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w' });
    expect(summary).to.be.an('object');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw if arguments are not valid', async () => {
    const getAddressSummary = getAddressSummaryFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressSummary([])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressSummary({})).to.be.rejectedWith('should have required property \'address\'');
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressSummary({ address: 1 })).to.be.rejectedWith('address should be string');
    expect(spy.callCount).to.be.equal(0);
  });
});
