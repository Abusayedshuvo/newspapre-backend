require("dotenv").config();

const config = {
  LOCAL_URL: process.env.LOCAL_URL,
  LIVE_URL: process.env.LIVE_URL,
};

module.exports = config;
