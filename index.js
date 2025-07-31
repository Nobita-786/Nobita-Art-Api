import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const MODELS = {
  1: "cjwbw/animegan2",              // AnimeGAN
  2: "fofr/anything-v3",            // Anime Anything
  3: "naoto0804/animegan-v2",       // Another AnimeGAN
  4: "stability-ai/stable-diffusion", // SD (for anime art too)
  5: "lambdal/text-to-pokemon",     // Fun model
};

app.get("/generate", async (req, res) => {
  const { imageUrl, modelNumber } = req.query;
  const model = MODELS[modelNumber] || MODELS[1];

  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "latest",
        input: { image: imageUrl },
        model: model
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error });

    res.json({ imageUrl: data?.output || "Processing..." });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server started on port", PORT);
});
