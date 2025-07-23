const express = require('express');
const app = express();
const port = 3000;
const request = require('request');
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(upload.array());

let mData = "";
let coinName = "bitcoin";
let mChart = "";

async function resData(coinName) {
    try {
        // Fetch market data
        let marketData = await new Promise((resolve, reject) => {
            request(`https://api.coingecko.com/api/v3/coins/${coinName}`, (error, response, body) => {
                if (error) {
                    console.error('Error fetching market data:', error);
                    return reject("An error occurred while fetching market data.");
                }

                if (response.statusCode === 429) {
                    console.error('Rate limit exceeded:', response.statusCode);
                    return reject("Rate limit exceeded. Please try again later.");
                }

                if (response.statusCode !== 200) {
                    console.error('Unexpected status code for market data:', response.statusCode);
                    return reject(`Unexpected status code for market data: ${response.statusCode}`);
                }

                try {
                    resolve(JSON.parse(body));
                } catch (parseError) {
                    console.error('Error parsing market data:', parseError);
                    reject("Error parsing market data.");
                }
            });
        });

        // Fetch market chart data
        let marketChart = await new Promise((resolve, reject) => {
            request(`https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=usd&days=30`, (error, response, body) => {
                if (error) {
                    console.error('Error fetching market chart data:', error);
                    return reject("An error occurred while fetching market chart data.");
                }

                if (response.statusCode === 429) {
                    console.error('Rate limit exceeded:', response.statusCode);
                    return reject("Rate limit exceeded. Please try again later.");
                }

                if (response.statusCode !== 200) {
                    console.error('Unexpected status code for market chart data:', response.statusCode);
                    return reject(`Unexpected status code for market chart data: ${response.statusCode}`);
                }

                try {
                    resolve(JSON.parse(body));
                } catch (parseError) {
                    console.error('Error parsing market chart data:', parseError);
                    reject("Error parsing market chart data.");
                }
            });
        });

        // Set the data
        mData = marketData;
        mChart = marketChart;
    } catch (error) {
        // Handle error
        console.error('Error in resData:', error);
        mData = { error: error.message };
        mChart = { error: error.message };
    }
}

app.get('/', async (req, res) => {
    await resData(coinName);
    res.render('index', { mData, mChart, coinName });
});

app.post('/', async (req, res) => {
    coinName = req.body.SelectCoin;
    await resData(coinName);
    res.render('index', { mData, mChart, coinName });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
