const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ AnimeGAN API is running!");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const replicateApiKey = process.env.REPLICATE_API_KEY;

  if (!imageUrl) return res.status(400).send("❌ imageUrl parameter is missing");

  try {
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "cb05b9f82b145c229351f27c4c554be568a5d1b5f243fe5f0c1fd8b2f8a9c8b0", // AnimeGAN-v2 version
        input: { image: imageUrl }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${replicateApiKey}`
        }
      }
    );

    const getUrl = response.data.urls.get;
    let outputUrl = null;

    // Poll until result is ready
    while (!outputUrl) {
      const result = await axios.get(getUrl, {
        headers: {
          Authorization: `Token ${replicateApiKey}`
        }
      });

      if (result.data.status === "succeeded") {
        outputUrl = result.data.output;
        break;
      } else if (result.data.status === "failed") {
        return res.status(500).send("❌ Generation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    res.json({ anime_image_url: outputUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error: Failed to process image.");
  }
});

app.listen(port, () => {
  console.log(`✅
