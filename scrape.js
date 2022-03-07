const puppeteer = require("puppeteer");
const FileSystem = require("fs");
var dataToWrite;
var fs = require("fs");
var readline = require("readline");
global.arr = [];

(async () => {
  var rd = readline.createInterface({
    input: fs.createReadStream("./Je-menu.csv"),
    output: process.stdout,
    console: false,
  });

  rd.on("line", async (line) => {
    if (line.includes("http")) {
      global.arr.push(line);
    }
  });

  rd.on("close", async (lastline) => {
    for (let line of global.arr) {
      try {
        const browser = await puppeteer.launch({
          headless: false,
          slowMo: 250,
        });
        const page = await browser.newPage();
        const url = line.split(",")[0]; 
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.setViewport({
          width: 360,
          height: 640,
        });
        const restInfo = await page.evaluate(() => JSON.parse(document.querySelector("script[type='application/ld+json']").innerText));
        const resultString = restInfo.name + ", " + restInfo.address.streetAddress + ", " + restInfo.address.postalCode + " " + url + ", " +  "\r\n";
        FileSystem.appendFileSync("just-eat-output-menu.csv", resultString);
        await browser.close();
      } catch (err) { console.log(err) }
    }
  })
})();
