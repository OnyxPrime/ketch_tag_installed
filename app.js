
const fs = require('fs');
const fileops = require('./fileops.js');
const webops = require('./webops.js');
const testUrls = ["https://www.google.com", "https://www.ketch.com", "https://www.patreon.com"];



const runProcess = async () => {
    var hrstart = process.hrtime()
    var urls = await fileops.getUrlsFromFile('OTCurls_Oct14.2021.txt');
    console.log(urls.length);
    var results = await webops.checkForKetchInstalled(urls);
    //var results = await webops.checkForKetchInstalled(testUrls);
    fileops.writeResultsToFile(results);
    var hrend = process.hrtime(hrstart);
    console.log(`Execution time (ms): ${(hrend[0] * 1000000000 + hrend[1]) / 1000000}`);
}

const runEvaluation = async (urls) => {
    var results = await webops.checkForKetchInstalled(urls);
    return results;
}
//runProcess();

const http = require('http');
const url = require('url');
const handler = async (req, res) => {
    var base = 'https://' + req.headers.host + '/';
    const parsedUrl = new url.URL(req.url, base);
    res.end;

    if(parsedUrl.pathname === '/api/evaluate' && parsedUrl.searchParams.get('urls')){
        const urls = parsedUrl.searchParams.get('urls')?.split(',');
        console.log(urls);
        if (urls.length > 3){
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Too many urls');
        }
        else{
            const results = await runEvaluation(urls);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }        
    } else if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html' })
        fs.createReadStream('index.html').pipe(res)
    
    }else {
        res.writeHead(404, {'Content-type':'text/plain'});
        res.end();
    };
}
const server = http.createServer(handler);

server.listen(process.env.PORT || 3000)