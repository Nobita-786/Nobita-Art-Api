const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
const models = require("./models");

app.get("/", (req, res) => {
  res.send("✅ Nobita AnimeGAN API is working!");
});

app.get("/generate", async (req, res) => {
  try {
    const { imageUrl, modelNumber } = req.query;

    if (!imageUrl || !modelNumber) {
      return res.status(400).json({ error: "Missing imageUrl or modelNumber" });
    }

    const model = models[modelNumber];
    if (!model) {
      return res.status(400).json({ error: "Invalid model number" });
    }

    const prediction = await axios.post(
      `https://api.replicate.com/v1/predictions`,
      {
        version: model,
        input: { image: imageUrl }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const predictionId = prediction.data.id;

    // Poll for completion
    let outputUrl = null;
    while (true) {
      const statusCheck = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        }
      );

      if (statusCheck.data.status === "succeeded") {
        outputUrl = statusCheck.data.output;
        break;
      } else if (statusCheck.data.status === "failed") {
        throw new Error("Model failed to generate output");
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    res.json({ imageUrl: outputUrl });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
