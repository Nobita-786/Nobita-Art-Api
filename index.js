const express = require("express");
const axios = require("axios");
const app = express();

const REPLICATE_API_TOKEN = "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi";

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) return res.status(400).send("Missing imageUrl");

  try {
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "8a7c370c...8c1d58b80e0b2be2cc459a5", // AnimeGANv2 version ID
        input: {
          image: imageUrl
        }
      },
      {
        headers: {
          "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const prediction = response.data;

    // Wait for completion
    let result;
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const check = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`
          }
        }
      );

      Object.assign(prediction, check.data);
    }

    if (prediction.status === "succeeded") {
      return res.json({ output: prediction.output });
    } else {
      return res.status(500).json({ error: "Failed to generate image." });
    }
  } catch (err) {
    console.error("API error:", err?.response?.data || err.message);
    return res.status(500).send("❌ Error: Failed to process image.");
  }
});

app.listen(3000, () => {
  console.log("AnimeGAN API is running on port 3000");
});
