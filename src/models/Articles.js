const mongoose = require("mongoose");

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
