const runServer = async (options) => {
    const fs = require('fs');
    const http = require('http');
    const url = require('url');
    const webopsV2 = require('../utilities/v4/webUtils.v4.js');
    const fileops = require('../utilities/v2/fileUtils.v2.js');
    const { AnalysisOptions } = require('../utilities/v4/analysisOptions.js');

    let tms = await fileops.loadJsonFile('./data/tms.json');
    let cmps = await fileops.loadJsonFile('./data/cmps.json');

    const handler = async (req, res) => {
        var base = 'https://' + req.headers.host + '/';
        const parsedUrl = new url.URL(req.url, base);

        if(parsedUrl.pathname === '/api/evaluate' && parsedUrl.searchParams.get('urls')){
            const urls = parsedUrl.searchParams.get('urls')?.split(',');
            const cmpSearch = parsedUrl.searchParams.get('cmpSearch');
            const tmSearch = parsedUrl.searchParams.get('tmSearch');
            const cookieSearch = parsedUrl.searchParams.get('cookieSearch') || true;

            console.log(urls);
            if (urls.length > 3){
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Too many urls');
            }
            else{
                var analysisOptions = new AnalysisOptions(urls, options.concurrency, tms, cmps, cookieSearch);
                const results = await webopsV2.analyzeUrls(analysisOptions);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            }        
        } else if (parsedUrl.pathname === '/') {
            res.writeHead(200, { 'content-type': 'text/html' })
            fs.createReadStream('./web/index.html').pipe(res)
        
        }else {
            res.writeHead(404, {'Content-type':'text/plain'});
            res.end();
        };
    }
    
    const server = http.createServer(handler);
    console.log('Server listening on http://localhost:' + options.port);
    server.listen(options.port || 3000)
}

const getCommand = () => { 
    const { Command, Option } = require('commander');
    return new Command('web')
        .description('Run Website Analyzer as a web page.')
        .addOption(new Option('-p, --port <number>', 'port number').default(3000).env('PORT'))
        .option('-c, --concurrency <int>', 'number of concurrent requests to make', 3)
        .action((options) => {
            runServer(options);
        });
}


module.exports = { 
    getCommand: getCommand
};