const puppeteer = require('puppeteer');

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

const checkForKetchInstalled = async (urls) => {    
        try {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true,
            });
            const page = await browser.newPage();
            let results = [];
            for (let i of urls) {
                let pageCheckStart = process.hrtime();
                try{
                    await page.goto(i);
                    let ketchExists = await chkForKetch(page); 
                    let pageCheckEnd = process.hrtime(pageCheckStart); 
                    results.push({url: i, result: ketchExists, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000});
                }
                catch (e) {
                    let pageCheckEnd = process.hrtime(pageCheckStart); 
                    results.push({url: i, result: false, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, error: e});
                }
            };    
            browser.close();
            return results;
        } catch (e) {
            return e;
        }
}

module.exports = {
    checkForKetchInstalled
}