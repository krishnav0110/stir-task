const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");



const dotenv = require("dotenv");
dotenv.config({ path: ".env" });





/**
 * mesh proxy api daily api refreshes at 00:00 UTC
 * we are refreshing our list every 12 hours after starting the server
 */
const { REFRESH_PROXIES_LIST_EVERY_X_HOUR } = require("./constants");





const app = express();
app.use(express.json());
app.use(cors());





mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME
})
.then(console.log("SUCCESS: Connected to MongoDB"))
.catch((err) => {
    console.error("ERROR: MongoDB connection");
    console.error(err);
});





const { refreshProxyList } = require("./util/proxyList");

refreshProxyList();
setInterval(refreshProxyList, REFRESH_PROXIES_LIST_EVERY_X_HOUR * 60 * 60 * 1000);





/**
 * frontend routes
 */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/index.html"));
});





/**
 * api routes
 */
const topicsRoute = require("./routes/topics");
const statusRoute = require("./routes/status");

app.use("/api/topics", topicsRoute);
app.use("/api/status", statusRoute);





app.listen("3000", () => {
  	console.log("START: server on port 3000");
});