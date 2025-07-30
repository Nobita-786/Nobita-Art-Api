require("dotenv").config();
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ AnimeGAN API is running!");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) return res.status(400).send("❌ Error: imageUrl is required");

  try {
    const formData = new FormData();
    formData.append("version", "your_model_version_id"); // <- replace with your model version ID
    formData.append("input", JSON.stringify({ image: imageUrl }));

    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    );

    const getUrl = response.data.urls.get;

    // Poll until completed
    let outputUrl = null;
    while (true) {
      const result = await axios.get(getUrl, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      });

      if (result.data.status === "succeeded") {
        outputUrl = result.data.output;
        break;
      } else if (result.data.status === "failed") {
        return res.status(500).send("❌ Error: Replicate processing failed");
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    res.json({ output: outputUrl });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ Error: Failed to process image.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
