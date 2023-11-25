const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.send("Server is Running!");
});

app.all("*", (req, res, next) => {
  console.log(req.url);
  const error = new Error(`The url is invalid : [${req.url}]`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
