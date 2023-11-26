const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connectDB");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Define a mongoose model
const Post = mongoose.model(
  "Post",
  {
    title: String,
    publishe: String,
    tag: Array,
    description: String,
    image: String,
  },
  "articles"
);

// Middleware to parse JSON
app.use(bodyParser.json());

// POST route to create a new post
app.post("/articles", async (req, res) => {
  try {
    const { title, publishe, tag, description, image } = req.body;
    const newPost = new Post({ title, publishe, tag, description, image });
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

const main = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
