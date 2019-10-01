/* global contract, assert */

const Test = require('../config/testConfig.js');
// const BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    let flightSuretyData, flightSuretyApp, testAddresses, firstAirline, weiMultiple

    before('setup contract', async () => {
        ({ flightSuretyData, flightSuretyApp, firstAirline, weiMultiple } = await Test.Config(accounts));
        await flightSuretyData.authorizeCaller(flightSuretyApp.address);
    });

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        const status = await flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        let accessDenied = false;
        try {
            await flightSuretyData.setOperatingStatus(false, { from: testAddresses[2] });
        } catch(e) {
            accessDenied = true;
        }

        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        let accessDenied = false;
        try {
            await flightSuretyData.setOperatingStatus(false);
        } catch(e) {
            accessDenied = true;
        }

        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await flightSuretyData.authorizeCaller(flightSuretyApp.address);
        } catch(e) {
            reverted = true;
        }

        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        await flightSuretyData.setOperatingStatus(true);
    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
        const newAirline = accounts[2];

        try {
            await flightSuretyApp.registerAirline(newAirline, { from: firstAirline });
        } catch(e) {
            if (!e.message.includes('Only funded airline can proceed.')) throw e;
        }
        const { 0: isRegistered } = await flightSuretyData.isAirline.call(newAirline);

        assert.equal(isRegistered, false, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline) have to subimit funding of 10 ether before participating in contract', async () => {
        await flightSuretyApp.provideFunding({ from: firstAirline, value: weiMultiple * 10 });

        const newAirline = accounts[2];
        await flightSuretyApp.registerAirline(newAirline, { from: firstAirline });
        const { 0: isRegistered } = await flightSuretyData.isAirline.call(newAirline);

        assert.equal(isRegistered, true, "Airline be able to register another airline if it has provided funding");
    });
 

});
