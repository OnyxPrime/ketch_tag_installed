const fs = require('fs');
const readline = require('readline');

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

async function getUrlsFromFile(filename) {    
    let urls = [];
    const fileStream = fs.createReadStream(filename);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.
      urls.push(line);
    }
    return urls;  
  }

  const writeResultsToFile = async (output, results) => {    
    try {
        var file = fs.createWriteStream(output, { flags: 'a'});
        file.write('url,Ketch Installed,Process Time (ms),banners,tag managers,errors\n');
        results.forEach(line => {
            file.write(`${line.url},${line.result},${line.pageCheckTime},${line.banners},${line.tagManagers},${line.error}\n`);
        });
    } catch (e) {
        return e;
    }
}

module.exports = { getUrlsFromFile, writeResultsToFile };