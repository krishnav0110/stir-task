const Proxy = require("../models/Proxy");



const url = process.env.PROXY_MESH_URL;





const getProxyList = async () => {
    try {
        const proxies = await Proxy.find({});
        const proxiesString = proxies.map(proxy => {
            return proxy.proxyString;
        });
        return proxiesString;
    }
    catch (error) {
        throw new Error("Cannot fetch proxies from MongoDB");
    }
};





const refreshProxyList = async () => {
    console.log("BEGIN: proxy List refreshing");

    const options = {
	    method: 'GET',
	    headers: {
		    'x-rapidapi-key': process.env.PROXY_MESH_API_KEY,
		    'x-rapidapi-host': process.env.PROXY_MESH_HOST
    	}
    };
    try {
        const response = await fetch(url, options);
        const result = await response.text();
    	const proxiesString = result.split("\n");
        const proxiesObject = proxiesString.map(string => {
            return { proxyString: string };
        });
	
        await Proxy.deleteMany({});
        await Proxy.insertMany(proxiesObject);
        console.log("END: proxy List refreshing");
    }
    catch (error) {
    	console.error("ERROR: refreshing proxies");
    	console.error(error);
    }
};





module.exports = { getProxyList, refreshProxyList };