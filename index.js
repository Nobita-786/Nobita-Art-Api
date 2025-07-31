const express = require("express");
const axios = require("axios");
const sharp = require("sharp");
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 3000;

// Replicate API key
const REPLICATE_API_TOKEN = "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi";

// Map of model numbers to Replicate model versions
const models = {
  1: "Anime-Premium-V2",
  2: "Cartoon-Premium",
  3: "maid-outfit-anime",
  4: "beach-babe-anime",
  5: "sweet-fantasy-anime",
  6: "love-story-comic",
  7: "highschool-memories",
  8: "festive-christmas",
  9: "onepiece-anime-pirate",
  10: "oshi-no-ko-popstar",
  11: "naruto-ninja-style",
  12: "dragonball-super-warriors",
  13: "death-note-style",
  14: "bleach-eternal-battle",
  15: "attack-on-titan-wings",
  16: "jujutsu-kaisen-magic",
  17: "prince-of-tennis",
  18: "demon-slayer-style",
  19: "fullmetal-alchemist",
  20: "my-hero-academia",
  21: "dr-stone-prehistoric",
  22: "haikyuu-court-clash",
  23: "ghibli-v1",
  24: "ghibli-v2",
  25: "webtoon-style"
};

app.get("/", (req, res) => {
  res.send("✅ Anime Art API is running by Raj");
});

app.get("/generate", async (req, res) => {
  try {
    const { imageUrl, modelNumber } = req.query;
    const modelKey = models[modelNumber];

    if (!imageUrl || !modelKey) {
      return res.status(400).json({ error: "Invalid imageUrl or modelNumber" });
    }

    const inputImage = await axios.get(imageUrl, {
      responseType: "arraybuffer"
    });

    const resizedImage = await sharp(inputImage.data)
      .resize(512, 512)
      .jpeg()
      .toBuffer();

    const form = new FormData();
    form.append("file", resizedImage, { filename: "image.jpg", contentType: "image/jpeg" });

    const uploadRes = await axios.post("https://file.io", form, {
      headers: form.getHeaders()
    });

    const tempImageUrl = uploadRes.data.link;

    const replicateRes = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: modelKey,
        input: { image: tempImageUrl }
      },
      {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resultURL = replicateRes.data?.urls?.get;
    if (!resultURL) return res.status(500).json({ error: "Failed to process image" });

    // Poll the result
    let outputUrl = null;
    for (let i = 0; i < 10; i++) {
      const poll = await axios.get(resultURL, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` }
      });
      if (poll.data.status === "succeeded") {
        outputUrl = poll.data.output;
        break;
      } else if (poll.data.status === "failed") {
        return res.status(500).json({ error: "Model failed to process image" });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!outputUrl) return res.status(500).json({ error: "Timeout while generating image" });

    res.json({ imageUrl: outputUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
