const cookieParser = require("cookie-parser");
const { LOCAL_URL, LIVE_URL } = require("../config/default");

const middlewares = (app) => {
  app.use(
    cors({
      origin: [LOCAL_URL, LIVE_URL],
      // credential: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());
};

module.exports = middlewares;
