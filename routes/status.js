const router = require("express").Router();
const { statusEmitter } = require("../util/statusEmiiter");





router.get("/", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const onStatusUpdate = (update) => {
        res.write(`event: ${update.event}\n`);
        res.write(`data: ${JSON.stringify(update)}\n\n`);
    };

    statusEmitter.on("statusUpdate", onStatusUpdate);

    req.on("close", () => {
        statusEmitter.removeListener("statusUpdate", onStatusUpdate);
    });
});



module.exports = router;