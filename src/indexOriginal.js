const puppeteer = require('puppeteer-core');
const fs = require('fs');
require('dotenv').config();

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const token = process.env.BROWSERLESS_API_TOKEN;

const recordSession = async ()=>{
    const wsEndpoint = `wss://production-sfo.browserless.io?token=${token}&headless=true&stealth&record=true`;
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    const page = await browser.newPage();
    await page.goto("https://us05web.zoom.us/j/7411289934?pwd=cElYbjdsb1Btc0V3b0N6OHhHaitRQT09");

    // The magic happens here
    const cdp = await page.createCDPSession();
    await cdp.send("Browserless.startRecording");
    await sleep(15000);
    const response = await cdp.send("Browserless.stopRecording");
    // ☝️ The response is a string containing a valid webm file
    console.log('RESPONSE: ',response);

    const file = Buffer.from(response.value, "binary");
    await fs.promises.writeFile("./recording.webm", file);

    await browser.close();
};
recordSession();
