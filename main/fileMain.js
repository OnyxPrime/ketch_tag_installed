const runProcess = async (input, output, concurrency, test = false) => {
    const fileops = require('../utilities/v2/fileUtils.v2.js');
    const webops = require('../utilities/v4/webUtils.v4.js');
    const testUrls = ["https://www.google.com", "https://www.ketch.com", "https://www.patreon.com"];

    var hrstart = process.hrtime()
    var urls;
    if (test) {
        urls = testUrls;
    } else {
        urls = await fileops.getUrlsFromFile(input);
    }
    var tms = await fileops.loadJsonFile('./data/tms.json');
    var cmps = await fileops.loadJsonFile('./data/cmps.json');
    console.log("Number of URLs to process: " + urls.length);
    var results = await webops.analyzeUrls(urls, concurrency, tms, cmps);
    fileops.writeResultsToFile(output, results);
    var hrend = process.hrtime(hrstart);
    console.log(`Execution time (ms): ${(hrend[0] * 1000000000 + hrend[1]) / 1000000}`);
}

const getCommand = () => {
    const { Command, Option } = require('commander');
    const dateUtils = require('../utilities/v1/dateUtils.js');

    return new Command('file')
        .description('Run Ketch Smart Tag checker on a list of urls from a file.')
        .addOption(new Option('-i, --input <filepath>', 'filename containing list of urls').conflicts('test'))
        .addOption(new Option('-t, --test', 'Run test urls').conflicts('input'))
        .option('-o, --output <filepath>', 'filename to output results', `./results/results-${dateUtils.formatDate(Date.now())}.csv`)
        .option('-c, --concurrency <amount>', 'number of concurrent requests to make', 5)
        .action((options) => {
            if (!options.test && !options.input) {
                console.log ('Please specify either --test or --input');
            }
            else {
            runProcess(options.input, options.output, options.concurrency, options.test);
            }
        });
}

module.exports = { 
    getCommand: getCommand
};