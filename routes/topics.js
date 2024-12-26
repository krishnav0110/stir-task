const router = require("express").Router();
const Topics = require("../models/Topics");

const { getTrendingTopics } = require("../util/trendingTopics");





router.get("/", async (req, res) => {
    try {
        const topics = new Topics(await getTrendingTopics());
        const savedTopics = await topics.save();
        res.status(200).json(savedTopics);
    } catch (err) {
        res.status(500).json(err);
    }
});



module.exports = router;