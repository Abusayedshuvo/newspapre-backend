require("dotenv").config();
const http = require("http");
const app = require("./src/app.js");
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const connectDB = require("./src/db/connectDB");
const main = require("./src/app.js");

main(port);
