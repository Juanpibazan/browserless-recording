const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const router = require('express').Router();

puppeteer.use(StealthPlugin());

const recordZoom = async () => {
  const browser = await puppeteer.launch({
    headless: false,           // required for screen-capture,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--start-maximized',
      '--auto-select-desktop-capture-source=Entire screen'
    ],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto("https://us05web.zoom.us/j/7411289934?pwd=cElYbjdsb1Btc0V3b0N6OHhHaitRQT09",{ waitUntil: 'networkidle2' });

  // inside the Node script, after page.goto(...)
await page.evaluate( async () => {
  // expose a global we can call later
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true
    });

    const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        // send the binary back to Node
        fetch('/upload', { method: 'POST', body: reader.result });
      };
      reader.readAsArrayBuffer(blob);
    };
    rec.start();
    window._recorder = rec;   // so we can stop it later

});
    // wait 8 h
    //await new Promise(r => setTimeout(r, 8 * 60 * 60 * 1000));
    await new Promise(r => setTimeout(r, 60 * 1000));
    await page.evaluate(() => window._rec.stop());
    await browser.close();
};

router.get('/run', async (req,res)=>{
    await recordZoom();
    res.status(200).json({
        status: true,
        msg: 'Recording function ran'
    });
});

module.exports = router;

