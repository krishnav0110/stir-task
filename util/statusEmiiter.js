const EventEmitter = require("events");
const statusEmitter = new EventEmitter();

module.exports = { statusEmitter };