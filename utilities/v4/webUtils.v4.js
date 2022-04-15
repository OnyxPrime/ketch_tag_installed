const puppeteer = require('puppeteer');
const bluebird = require("bluebird");
const {UrlInfo} = require('./urlInfo');

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

const analyzeForKetch = (request) => {
}

const analyzeForTagManager = (request, tmps) => {
    let url = request.url();
    let result = tmps.find(o => url.includes(o.identifier));

    if (result) {
        return result.name;
    } else {
        return '';
    }
}

const analyzeForBanner = (request, cmps) => {
    let url = request.url();
    // let method = request.method();
    // let headers = request.headers();
    // let postData = request.postData();
    
    let ketchExists = false;
    let banner = '';
    let result = cmps.find(o => url.includes(o.identifier));

    if (result) {
        if (result.name === 'Ketch') {
            ketchExists = true;
        }
        banner = result.name;
    }

    return {ketchExists: ketchExists, banner: banner};
}

const analyzeRequest = (request, tms, cmps) => {
    let bannerInfo = analyzeForBanner(request, cmps);
    let tagManager = analyzeForTagManager(request, tms);

    return {ketchExists: bannerInfo.ketchExists, banner: bannerInfo.banner, tagManager: tagManager};
}

const analyzePageCookies = async (page) => {
    let t = await page._client.send('Network.getAllCookies');
    let firstPartyCookies = await page.cookies();
    let thirdPartyCookies = t.cookies.filter(o => !firstPartyCookies.some(p => p.name === o.name));
    return {firstPartyCookies: firstPartyCookies, thirdPartyCookies: thirdPartyCookies};
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
                            let ketchExists = false;
                            let banners = [];
                            let tagManagers = [];
                            await page.setRequestInterception(true);
                            page.on('request', (request) => {
                                let analysis = analyzeRequest(request);    
                                if (analysis.ketchExists) ketchExists = true;
                                banners.push(analysis.banner);
                                tagManagers.push(analysis.tagManager);
                                request.continue();                                
                            });
                            await page.goto(url, {waitUntil: 'networkidle0'});
                            let pageCheckEnd = process.hrtime(pageCheckStart); 
                            let uniqueBanners = [...new Set(banners)].filter(Boolean).join(';');
                            let uniqueTagManagers = [...new Set(tagManagers)].filter(Boolean).join(';');
                            r = {url: url, result: ketchExists, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, banners: uniqueBanners, tagManagers: uniqueTagManagers, error: ''};
                        }
                        catch (e) {
                            let pageCheckEnd = process.hrtime(pageCheckStart);
                            r = {url: url, result: false, pageCheckTime: (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, banners: '', tagManagers: '', error: e};
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

const analyzeUrls = async (analysisOptions) => {try {
    return await withBrowser(async (browser) => {
        let count = 1;
        return bluebird.map(analysisOptions.urls, async (url) => {
            return withPage(browser)(async (page) => {
                let pageCheckStart = process.hrtime();
                let r;
                try {
                    let ketchExists = false;
                    let banners = [];
                    let tagManagers = [];
                    let cookies;
                    await page.setRequestInterception(true);
                    page.on('request', (request) => {
                        // Analyze request to see if it's calling a known a CMP
                        if (analysisOptions.cmps) {
                            var banner = analyzeForBanner(request, analysisOptions.cmps);
                            if (banner.ketchExists) ketchExists = true;
                            banners.push(banner.banner);
                        }

                        // Analyze request to see if it's calling a known tag manager
                        if (analysisOptions.tms) {
                            tagManagers.push(analyzeForTagManager(request, analysisOptions.tms));
                        } 
                        request.continue();                                
                    });
                    await page.goto(url, {waitUntil: 'networkidle0'});

                    //Get cookies
                    if (analysisOptions.cookies) {
                        cookies = await analyzePageCookies(page);
                    }
                    let pageCheckEnd = process.hrtime(pageCheckStart); 
                    let uniqueBanners = [...new Set(banners)].filter(Boolean).join(';');
                    let uniqueTagManagers = [...new Set(tagManagers)].filter(Boolean).join(';');
                    r = new UrlInfo(url, ketchExists, uniqueBanners, uniqueTagManagers, (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, '', cookies);
                }
                catch (e) {
                    let pageCheckEnd = process.hrtime(pageCheckStart);
                    r = new UrlInfo(url, false, '', '', (pageCheckEnd[0] * 1000000000 + pageCheckEnd[1]) / 1000000, e);
                }
                process.stdout.write(`${count++} urls processed.\r`);
                return r;
            });
        }, {concurrency: analysisOptions.concurrency});
    });
} catch (e) {
    console.log(e);
    return e;
}
}

module.exports = {
    checkForKetchInstalled,
    analyzeUrls
}