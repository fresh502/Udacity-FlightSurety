import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

const config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const indexes = [];
(async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        for (let i = 10; i < 30; i++) {
            const gas = await flightSuretyApp.methods.registerOracle().estimateGas({ from: accounts[i], value: web3.utils.toWei('1', 'ether') });
            await flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: web3.utils.toWei('1', 'ether'), gas });
            const index = await flightSuretyApp.methods.getMyIndexes().call({ from: accounts[i] });
            indexes.push({ oracle: accounts[i], index })
        }
        console.log('\nRegister all oracels and save indexes in memory');
        console.log(indexes);
    } catch(e) {
        console.error(e);
    }
})()

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})

export default app;


