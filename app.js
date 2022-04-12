const dateUtils = require('./utilities/v1/dateUtils.js');
const fileMain = require('./utilities/v1/fileMain.js');
const serverMain = require('./utilities/v1/serverMain.js');

const { Command, Option } = require('commander');
const program = new Command();

program
  .name('ketch-tag-checker')
  .description('Check whether or not Ketch Smart Tag is installed on a list of urls')
  .version('0.1.0');

program.command('file')
  .description('Run Ketch Smart Tag checker on a list of urls from a file.')
  .addOption(new Option('-i, --input <filepath>', 'filename containing list of urls').conflicts('test'))
  .addOption(new Option('-t, --test', 'Run test urls').conflicts('input'))
  .option('-o, --output <filepath>', 'filename to output results', `./results/results-${dateUtils.formatDate(Date.now())}.csv`)
  .option('-c, --concurrency <amount>', 'number of concurrent requests to make', 5)
  .action((options) => {
    fileMain.run(options.input, options.output, options.concurrency, options.test);
  });

program.command('web')
  .description('Run Ketch Smart Tag Checker as a web page.')
  .addOption(new Option('-p, --port <number>', 'port number').default(3000).env('PORT'))
  .option('-c, --concurrency <int>', 'number of concurrent requests to make', 3)
  .action((options) => {
    serverMain.run(options.port);
  });

program.parse(process.argv);
