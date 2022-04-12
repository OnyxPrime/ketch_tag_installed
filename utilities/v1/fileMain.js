const runProcess = async (input, output, concurrency, test = false) => {
    const fileops = require('./fileUtils.js');
    const webopsV2 = require('../v2/webUtils.v2.js');
    const testUrls = ["https://www.google.com", "https://www.ketch.com", "https://www.patreon.com"];

    var hrstart = process.hrtime()
    var urls;
    if (test) {
        urls = testUrls;
    } else {
        urls = await fileops.getUrlsFromFile(input);
    }
    console.log("Number of URLs to process: " + urls.length);
    var results = await webopsV2.checkForKetchInstalled(urls, concurrency);
    fileops.writeResultsToFile(output, results);
    var hrend = process.hrtime(hrstart);
    console.log(`Execution time (ms): ${(hrend[0] * 1000000000 + hrend[1]) / 1000000}`);
}

module.exports = { run: runProcess };