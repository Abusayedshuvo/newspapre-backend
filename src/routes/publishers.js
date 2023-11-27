// routes/publishers.js

const express = require("express");
const router = express.Router();
const Publisher = require("../models/Publisher");

// POST /publishers
router.post("/", async (req, res) => {
  const { publisherName, publisherLogo } = req.body;

  try {
    const newPublisher = new Publisher({
      publisherName,
      publisherLogo,
    });

    const savedPublisher = await newPublisher.save();

    res.status(201).json({
      message: "Publisher created successfully",
      publisher: savedPublisher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
