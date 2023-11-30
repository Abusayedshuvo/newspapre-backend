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
    origin: ["https://assignment-12-a54cf.web.app", "http://localhost:5173"],
    // origin: [process.env.LIVE_URL, process.env.LOCAL_URL],
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
    views: { type: Number, default: 0 },
    premium: Boolean,
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
      premium,
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
      premium,
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
    const articles = await Post.find().sort({ views: -1 });
    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    console.log(articleId);
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

app.get("/articles/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const articles = await Post.find({ authorEmail: userEmail });

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/articles/:id/update-views", async (req, res) => {
  try {
    const articleId = req.params.id;
    const updatedArticle = await Post.findByIdAndUpdate(
      articleId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/articles/approve/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const updatedArticle = await Post.findByIdAndUpdate(
      articleId,
      { $set: { status: "Approved" } },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/premium-articles", async (req, res) => {
  try {
    const premiumArticles = await Post.find({ premium: true }).sort({
      views: -1,
    });
    res.status(200).json(premiumArticles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/article-count", async (req, res) => {
  try {
    const articles = await Post.find();

    const result = articles.reduce((acc, article) => {
      const publisherName = article.publishe;
      if (!acc[publisherName]) {
        acc[publisherName] = 1;
      } else {
        acc[publisherName]++;
      }
      return acc;
    }, {});

    const formattedResult = Object.entries(result).map(
      ([publisherName, count]) => [publisherName, count]
    );

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update premium status of an article
app.patch("/articles/premium/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Post.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    article.premium = true;
    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete an article by ID
app.delete("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const result = await Post.deleteOne({ _id: articleId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.status(200).json({ message: "Article deleted successfully" });
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

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update user
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

// Patch admin
// const userRoutes = require("./routes/users");
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
