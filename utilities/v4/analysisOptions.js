class AnalysisOptions {
    constructor(urls, concurrency, tms, cmps, cookies) {
        this.urls = urls;
        this.concurrency = concurrency;
        this.tms = tms;
        this.cmps = cmps;
        this.cookies = cookies;
    } 
}

module.exports = { AnalysisOptions }