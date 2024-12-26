const { statusEmitter } = require("./statusEmiiter");
const { USE_DEFAULT_IP_AFTER_X_FAILED_PROXIES } = require("../constants");



const { Builder, Browser, By, until } = require("selenium-webdriver");
const seleniumProxy = require("selenium-webdriver/proxy");



const seleniumWebDriverName = "edge";
const seleniumWebBrowserName = Browser.EDGE;



const webBrowser = require(`selenium-webdriver/${seleniumWebDriverName}`);

const { getProxyList } = require("./proxyList");





const getTrendingTopics = async () => {
    let proxies = [];
    try {
        proxies = await getProxyList();
    }
    catch (error) {
        console.error(`ERROR: ${error}`);
    }

    let proxyIpUsed = null;
    let driver = null;
    let failedProxyCounter = 0;



    /**
     * finding a working proxy
     */
    for (let proxyString in proxies) {
        if (failedProxyCounter % 5 === 0) {
            statusEmitter.emit("statusUpdate", { event: "proxyFind", failedProxyCount: failedProxyCounter, totalProxies: proxies.length });
            console.log(`current failed proxy count: ${failedProxyCounter} / ${proxies.length}`);
        }
        if (USE_DEFAULT_IP_AFTER_X_FAILED_PROXIES &&
            failedProxyCounter > USE_DEFAULT_IP_AFTER_X_FAILED_PROXIES
        ) {
            break;
        }



        const proxy = seleniumProxy.manual({
            http: proxyString,
            https: proxyString,
        });
        const options = new webBrowser.Options(`--proxy-server=http://${proxyString}`);
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");

        driver = new Builder()
            .forBrowser(seleniumWebBrowserName)
            .setProxy(proxy)
            .setEdgeOptions(options)
            .build()
        ;

        try {
            await driver.get("https://x.com");
            proxyIpUsed = proxyString;
            break;
        }
        catch (error) {
            await driver.quit();
            driver = null;
            failedProxyCounter++;
        }
    }
    console.log(`total failed proxy count: ${failedProxyCounter} / ${proxies.length}`);



    /**
     * use default IP if all of the proxies failed
     */
    if (proxyIpUsed === null && driver === null) {
        const options = new webBrowser.Options();
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");

        driver = new Builder()
            .forBrowser(seleniumWebBrowserName)
            .setEdgeOptions(options)
            .build()
        ;
    }



    const email = process.env.TWITTER_EMAIL;
    const username = process.env.TWITTER_USERNAME;
    const password = process.env.TWITTER_PASSWORD;



    try {
        console.log("BEGIN: fetching topics");
        statusEmitter.emit("statusUpdate", { event: "fetchTopics", defaultIpUsed: proxyIpUsed? false:true });

        await driver.get("http://whatismyip.akamai.com/");

        const ipElement = await driver.wait(until.elementLocated(By.xpath("//body")), 10000);
        const ipAddress = await ipElement.getAttribute("innerHTML");
        console.log(`ip: ${ipAddress}`);

        await driver.get("https://x.com/login");

        const emailInput = await driver.wait(until.elementLocated(By.xpath("//input[@autocomplete='username']")), 10000);
        await emailInput.sendKeys(email);
        const emailNextBtn = await driver.wait(until.elementLocated(By.xpath("//button[.//child::*[text()='Next']]")), 10000);
        await emailNextBtn.click();

        const usernameInput = await driver.wait(until.elementLocated(By.xpath("//input[@autocomplete='on']")), 10000);
        await usernameInput.sendKeys(username);
        const usernameNextBtn = await driver.wait(until.elementLocated(By.xpath("//button[.//child::*[text()='Next']]")), 10000);
        await usernameNextBtn.click();

        const passwordInput = await driver.wait(until.elementLocated(By.xpath("//input[@autocomplete='current-password']")), 10000);
        await passwordInput.sendKeys(password);
        const loginBtn = await driver.wait(until.elementLocated(By.xpath("//button[.//child::*[text()='Log in']]")), 10000);
        await loginBtn.click();

        const trendingLinks = await driver.wait(until.elementsLocated(By.xpath("//div[@aria-label='Timeline: Trending now']//div[@data-testid='trend']")), 10000);
        const trendingTopics = [];

        for (let trendingLink of trendingLinks) {
            const topic = await trendingLink.findElement(By.xpath(".//div//div[2]//span[not(*)]"));
            trendingTopics.push(await topic.getAttribute("innerHTML"));
        }

        const currentDateTime = new Date();
        console.log("END: fetching topics");
        return {
            ip: ipAddress,
            dateTime: currentDateTime,
            topics: trendingTopics
        };
    }
    catch (error) {
        console.error("ERROR: fetching topics");
    }
    finally {
        await driver.quit();
    }
};

module.exports = { getTrendingTopics };