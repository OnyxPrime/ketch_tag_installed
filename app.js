const fileMain = require('./main/fileMain.js');
const serverMain = require('./main/serverMain.js');

const { Command } = require('commander');
const program = new Command();

program
  .name('Website Analyzer')
  .description('Analyze websites for Tag Managers, CMP, and Cookies')
  .version('0.1.0');

program.addCommand(fileMain.getCommand());
program.addCommand(serverMain.getCommand());

program.parse(process.argv);
