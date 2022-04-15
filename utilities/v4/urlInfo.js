class UrlInfo {
    ketchExists = false;
    constructor(url, ketchExists, banner, tagManager, pageCheckTime, error, cookies) {
        this.url = url;
        this.ketchExists = ketchExists;
        this.banner = banner;
        this.tagManager = tagManager;
        this.pageCheckTime = pageCheckTime;
        this.error = error;
        this.cookies = cookies
    }

    toString(){
        let cookiesString = JSON.stringify(this.cookies);
        return `${this.url},${this.ketchExists},${this.banner},${this.tagManager},${this.pageCheckTime},${this.error},${cookiesString}`;
    }

    static getKeyString() {
        return `url,Ketch Installed,banners,tag managers,Process Time (ms),errors,cookies`;
    }
}
module.exports = { UrlInfo }