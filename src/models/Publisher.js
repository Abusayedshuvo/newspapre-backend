const mongoose = require("mongoose");
const publisherSchema = new mongoose.Schema({
  publisherName: String,
  publisherLogo: String,
});
const Publisher = mongoose.model("Publisher", publisherSchema);
module.exports = Publisher;
