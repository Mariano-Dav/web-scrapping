const puppeteer = require("puppeteer");
const FileSystem = require("fs");
var dataToWrite;
var fs = require("fs");
var readline = require("readline");
global.arr = [];

(async () => {
  var rd = readline.createInterface({
    input: fs.createReadStream("./Je-mad.csv"),
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
        if (!url.includes("https")) continue;
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.setViewport({
          width: 360,
          height: 640,
        });

        var resUrl, rating, ratingantal;
        resUrl = rating = ratingantal = "null";
        let pageDoc = await page.evaluate(async () => {
            return await new Promise(resolve => {
              var data = [];
              var scrolledHeight = 0;
              var distance = 100; 
              var timerId;
              timerId = setInterval(() => {
                  var scrollHeight = document.documentElement.scrollHeight
                  window.scrollBy(0, distance)
                  scrolledHeight += distance
                  if(scrolledHeight >= scrollHeight){
                      clearInterval(timerId);
                      Array.from(document.querySelectorAll("li._2ro375")).map((node, index) => {
                        var checkRating, resUrl, rating, ratingantal;
                        resUrl = rating = ratingantal = null; 
                        resUrl = node.querySelector(
                          "#page > div._2gQt3a > section > div._2XUNYq > div > div > div._1YtbW > ul > li > div > a"
                        ).href;
                        checkRating = node.querySelector("b._2LV0z.JvtN2._354yY");
                        if(checkRating) {
                          rating = checkRating.innerText.trim();
                          ratingantal = node.querySelector("._29COo > ._2LV0z.JvtN2.Rfk_i").innerText.trim();
                        }
                        let resultString = resUrl + ", " + rating + ", " + ratingantal + "\r\n";
                        data.push(resultString);
                      });
                      resolve(data);
                  }
              }, 10)
            })
        })
        FileSystem.appendFileSync("just-eat-output-mad.csv", pageDoc.length ? pageDoc : ["null", "null", "null\n"]);
        await browser.close();
      } catch (err) {
        console.log(err.message);
      }
    }
  });
})();
