const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connectDB");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

const mongoose = require("mongoose");

app.use(
  cors({
    origin: [process.env.LOCAL_URL],
    credentials: true,
  })
);
app.use(express.json());

// Define a mongoose model
const Post = mongoose.model(
  "Post",
  {
    title: String,
    publishe: String,
    tag: Array,
    description: String,
    imageUrl: String,
    authorName: String,
    authorEmail: String,
    authorPhoto: String,
    postedDate: String,
    status: String,
  },
  "articles"
);

// JWT Token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "3h",
  });
  res.send({ token });
});

// middlewares
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// POST route to create a new post
app.post("/articles", async (req, res) => {
  try {
    const {
      title,
      publishe,
      tag,
      description,
      imageUrl,
      status,
      postedDate,
      authorName,
      authorEmail,
      authorPhoto,
    } = req.body;
    const newPost = new Post({
      title,
      publishe,
      tag,
      description,
      imageUrl,
      status,
      postedDate,
      authorName,
      authorEmail,
      authorPhoto,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/articles", async (req, res) => {
  try {
    const articles = await Post.find();
    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Post.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User related api
const User = require("./models/User");

app.post("/users", async (req, res) => {
  try {
    const userData = req.body;
    console.log("Received data:", userData);
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.send({ message: "User already exists", insertedId: null });
    }
    const newUser = new User(userData);
    const result = await newUser.save();
    res.send({
      message: "User inserted successfully",
      insertedId: result._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Patch admin
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// Publisher api
const publisherRoutes = require("./routes/publishers");
app.use("/publishers", publisherRoutes);

app.get("/health", (req, res) => {
  res.send("Server is Running!");
});

app.all("*", (req, res, next) => {
  const error = new Error(`The url is invalid : [${req.url}]`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
  });
});

const main = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = main;
