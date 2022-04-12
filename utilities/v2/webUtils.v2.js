const puppeteer = require('puppeteer');
const bluebird = require("bluebird");

const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	try {
		return await fn(browser);
	} finally {
		await browser.close();
	}
}

const withPage = (browser) => async (fn) => {
	const page = await browser.newPage();
	try {
		return await fn(page);
	} finally {
		await page.close();
	}
}

const chkForKetch = async (page) => {
    return await page.evaluate(() => {     
        let items = document.querySelectorAll('head > script');                
        for (let i of items) {
            let src = i.getAttribute('src');
            if (src && src.includes('ketchcdn')) {
                return true;
            }
        }    
        return false;
    })
}

const checkForKetchInstalled = async (urls, concurrency = 5) => {    
        try {
            return await withBrowser(async (browser) => {
                let count = 1;
                return bluebird.map(urls, async (url) => {
                    return withPage(browser)(async (page) => {
                        let pageCheckStart = process.hrtime();
                        let r;
                        try {
                            await page.goto(url);
                            let ketchExists = await chkForKetch(page); 
                            let pageCheckEnd = process.hrtime(pageCheckStart); 
                            r = {url: url, result: ketchExists, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000};
                        }
                        catch (e) {
                            let pageCheckEnd = process.hrtime(pageCheckStart);
                            r = {url: url, result: false, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, error: e};
                        }
                        process.stdout.write(`${count++} urls processed.\r`);
                        return r;
                    });
                }, {concurrency: concurrency});
            });
        } catch (e) {
            console.log(e);
            return e;
        }
}

module.exports = {
    checkForKetchInstalled
}