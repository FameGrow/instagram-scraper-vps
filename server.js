require("dotenv").config();
const express = require("express");
const scrapeUser = require("./scraper");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/posts/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const posts = await scrapeUser(username);
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Scraping failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper running on http://localhost:${PORT}`);
});
