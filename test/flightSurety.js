/* global contract, assert */

const Test = require('../config/testConfig.js');
// const BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    let flightSuretyData, flightSuretyApp, testAddresses, firstAirline
    before('setup contract', async () => {
        ({ flightSuretyData, flightSuretyApp, firstAirline } = await Test.Config(accounts));
        await flightSuretyData.authorizeCaller(flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        const status = await flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await flightSuretyData.setOperatingStatus(false, { from: testAddresses[2] });
        } catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
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

        // Set it back for other tests to work
        await flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
        // ARRANGE
        const newAirline = accounts[2];

        // ACT
        try {
            await flightSuretyApp.registerAirline(newAirline, { from: firstAirline });
        } catch(e) {
            if (!e.message.includes('Only Funded airline can register new airline.')) throw e;
        }
        const result = await flightSuretyData.isAirline.call(newAirline); 

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });
 

});
