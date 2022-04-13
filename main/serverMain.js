const runServer = async (port, concurrency) => {
    const fs = require('fs');
    const http = require('http');
    const url = require('url');
    const webopsV2 = require('../utilities/v2/webUtils.v2.js');

    const handler = async (req, res) => {
        var base = 'https://' + req.headers.host + '/';
        const parsedUrl = new url.URL(req.url, base);

        if(parsedUrl.pathname === '/api/evaluate' && parsedUrl.searchParams.get('urls')){
            const urls = parsedUrl.searchParams.get('urls')?.split(',');
            console.log(urls);
            if (urls.length > 3){
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Too many urls');
            }
            else{
                const results = await webopsV2.checkForKetchInstalled(urls, concurrency);;
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
    console.log('Server listening on http://localhost:' + port);
    server.listen(port || 3000)
}

const getCommand = () => { 
    const { Command, Option } = require('commander');
    return new Command('web')
        .description('Run Ketch Smart Tag Checker as a web page.')
        .addOption(new Option('-p, --port <number>', 'port number').default(3000).env('PORT'))
        .option('-c, --concurrency <int>', 'number of concurrent requests to make', 3)
        .action((options) => {
            runServer(options.port);
        });
}


module.exports = { 
    getCommand: getCommand
};