const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

const bodyParser = require("body-parser");

const { LOCAL_URL } = require("../config/default");

const applyMiddlewares = (app) => {
  app.use(
    cors({
      origin: [LOCAL_URL],
      credential: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Middleware to parse JSON
  app.use(bodyParser.json());
};

module.exports = applyMiddlewares;
