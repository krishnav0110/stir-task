const mongoose = require("mongoose");



const TopicsSchema = new mongoose.Schema({
    topics: {
        type: Array,
        required: true,
    },
    dateTime: {
        type: Date,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.models.Topics || mongoose.model("Topics", TopicsSchema);