const fileMain = require('./main/fileMain.js');
const serverMain = require('./main/serverMain.js');

const { Command } = require('commander');
const program = new Command();

program
  .name('ketch-tag-checker')
  .description('Check whether or not Ketch Smart Tag is installed on a list of urls')
  .version('0.1.0');

program.addCommand(fileMain.getCommand());
program.addCommand(serverMain.getCommand());

program.parse(process.argv);
