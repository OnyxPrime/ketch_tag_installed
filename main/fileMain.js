const runProcess = async (options) => {
    const fileops = require('../utilities/v2/fileUtils.v2.js');
    const webops = require('../utilities/v4/webUtils.v4.js');
    const { AnalysisOptions } = require('../utilities/v4/analysisOptions.js');
    const testUrls = ["https://www.google.com", "https://www.ketch.com", "https://www.patreon.com"];

    var hrstart = process.hrtime()
    var urls, tms, cmps;
    if (options.test) {
        urls = testUrls;
    } else if (options.url) {
        urls = [options.url];
    } else {
        urls = await fileops.getUrlsFromFile(options.input);
    }
    if (options.tagManagers) {
        tms = await fileops.loadJsonFile('./data/tms.json');
    }
    if (options.consentManagementProviders) {
        cmps = await fileops.loadJsonFile('./data/cmps.json');
    }
    var analysisOptions = new AnalysisOptions(urls, options.concurrency, tms, cmps, options.cookies);

    console.log("Number of URLs to process: " + urls.length);
    var results = await webops.analyzeUrls(analysisOptions);
    fileops.writeNewResultsToFile(options.output, results);
    var hrend = process.hrtime(hrstart);
    console.log(`Execution time (ms): ${(hrend[0] * 1000000000 + hrend[1]) / 1000000}`);
}

const getCommand = () => {
    const { Command, Option } = require('commander');
    const dateUtils = require('../utilities/v1/dateUtils.js');

    return new Command('file')
        .description('Run Website Analyze on a list of urls from a file.')
        .addOption(new Option('-i, --input <filepath>', 'filename containing list of URLs').conflicts(['test', 'url']))
        .addOption(new Option('-t, --test', 'Run test URLs').conflicts('input').default(false))
        .addOption(new Option('-tm, --tag-managers', 'Identify Consent Management Providers'))
        .addOption(new Option('-cmp, --consent-management-providers', 'Checks URLs for Ketch Tag only'))
        .addOption(new Option('-ck, --cookies', 'Identify first and third party cookies'))
        .addOption(new Option('-u, --url <url>', 'Runs single URL specified').conflicts(['input', 'test']))
        .option('-o, --output <filepath>', 'filename to output results', `./results/results-${dateUtils.formatDate(Date.now())}.csv`)
        .option('-c, --concurrency <amount>', 'number of concurrent requests to make', 5)
        .action((options) => {
            if (!options.test && !options.input && !options.url) {
                console.log ('Please specify either --test, --input, or --url');
            } else {
                runProcess(options);
            }
        });
}

module.exports = { 
    getCommand: getCommand
};