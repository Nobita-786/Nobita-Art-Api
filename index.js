const express = require("express");
const Replicate = require("replicate");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Root route
app.get("/", (req, res) => {
  res.send("✅ Nobita AnimeGAN API is working!");
});

// Main generate route
app.get("/generate", async (req, res) => {
  try {
    const imageUrl = req.query.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl parameter" });
    }

    const output = await replicate.run(
      "tencentarc/animeganv2:25d40dfce8c678c5b0c594d62eabfac53fdf3937c42c50d59efc1f0b4e4c17b3",
      {
        input: {
          image: imageUrl,
        },
      }
    );

    res.json({ output });
  } catch (err) {
    console.error("❌ Error in /generate:", err);
    res.status(500).json({ error: "Failed to process image." });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
