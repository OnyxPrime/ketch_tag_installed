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

const analyzeForTagManager = (request) => {
    let url = request.url();

    if (url.includes('adobetagmanager.com') || url.includes('adobedtm')) {
        return 'Adobe Tag Manager';
    } else if (url.includes('googletagmanager.com')) {
        return 'Google Tag Manager';
    } else if (url.includes('tiqcdn') || url.includes('tealium')) {
        return 'Tealium';
    } else if (url.includes('tagcommander')) {
        return 'Tag Commander';
    } else if (url.includes('marketing.containers.piwik')) {
        return 'Piwik Pro';
    } else if (url.includes('btstatic.com')) {
        return 'Signal';
    } else {
        return '';
    }
}

const analyzeForBanner = (request) => {
    let url = request.url();
    // let method = request.method();
    // let headers = request.headers();
    // let postData = request.postData();
    
    let ketchExists = false;
    let banner = '';
    
    if (url.includes('ketchcdn')) {
        ketchExists = true;
        banner = 'Ketch';
    } else if (url.includes('cookielaw.org')) {
        banner = 'OneTrust';
    } else if (url.includes('cookiebot')) {
        banner = 'Cookiebot';
    } else if (url.includes('trustarc')) {
        banner = 'TrustArc';
    } else if (url.includes('termsfeed.com')) {
        banner = 'TermsFeed';
    } else if (url.includes('iubenda')) {
        banner = 'Iubenda';
    } else if (url.includes('consentmanager.net')) {
        banner = 'Consent Manager';
    } else if (url.includes('cookieyes.com')) {
        banner = 'CookieYes';
    } else if (url.includes('complianz')) {
        banner = 'Complianz (WP plugin)';
    } else if (url.includes('cookie-notice')) {
        banner = 'Cookie Notice & Cookie Compliance (WP plugin)';
    } else if (url.includes('eu_cookie_compliance')) {
        banner = 'EU Cookie Compliance (Drupal plugin)';
    } else if (url.includes('orestbida')) {
        banner = 'JS Plugin written by Orest Bida';
    } else if (url.includes('trustcommander')) {
        banner = 'Commanders Act';
    } 

    return {ketchExists: ketchExists, banner: banner};
}

const analyzeRequest = (request) => {
    let bannerInfo = analyzeForBanner(request);
    let tagManager = analyzeForTagManager(request);

    return {ketchExists: bannerInfo.ketchExists, banner: bannerInfo.banner, tagManager: tagManager};
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

module.exports = {
    checkForKetchInstalled
}