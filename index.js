const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("✅ Nobita AnimeGAN API is working!");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const modelNumber = req.query.modelNumber || "1"; // Default model

  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

  try {
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: getModelVersion(modelNumber),
        input: { image: imageUrl }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const getUrl = response.data.urls.get;
    let outputUrl = null;

    // Polling until the output is ready
    for (let i = 0; i < 20; i++) {
      const statusRes = await axios.get(getUrl, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`
        }
      });

      if (statusRes.data.status === "succeeded") {
        outputUrl = statusRes.data.output;
        break;
      } else if (statusRes.data.status === "failed") {
        return res.status(500).json({ error: "Generation failed" });
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!outputUrl) {
      return res.status(500).json({ error: "Timed out waiting for output" });
    }

    res.json({ imageUrl: outputUrl });
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

function getModelVersion(modelNumber) {
  const models = {
    "1": "a9ebc1763abc4edb8c3759d2ecba05b3", // AnimeGANv2 (Hayao)
    "2": "7b16f5c74bdf4d6b8ce43f2f4e4f04a5", // AnimeGANv2 (Paprika)
    "3": "28e30be8b03a49aaae6fb47bf2029f0e", // CartoonGAN (Shinkai)
    "4": "db21e9d1bfb04c9eb49f83baf194ce2f", // Arcane-style
    "5": "c3f406234b1f405b9d7b2c2e3e8e8fa4"  // Naruto style
  };

  return `replicate/${models[modelNumber]}`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
