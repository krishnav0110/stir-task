const mongoose = require("mongoose");



const ProxySchema = new mongoose.Schema({
    proxyString: {
        type: String,
    },
});

module.exports = mongoose.models.Proxy || mongoose.model("Proxy", ProxySchema);