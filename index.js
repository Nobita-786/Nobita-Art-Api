// index.js
const express = require("express");
const runModel = require("./replicate");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Map of model numbers to Replicate model versions
const modelMap = {
  1: "t2v-realisticvision", // Replace below with real Replicate versions
  2: "cjwbw/animegan",
  3: "nateraw/cartoonify",
  4: "rinongal/ghibli-diffusion",
  5: "nitrosocke/mo-di-diffusion",
  6: "lucataco/anything-v3.0",
  7: "andite/anything-v4.0",
  8: "stability-ai/stable-diffusion",
  9: "cjwbw/ghost-style",
  10: "pharmapsychotic/kl-f8-anime2",
  11: "camenduru/anime-style",
  12: "prompthero/openjourney",
  13: "gmgiorgi/portraitplus",
  14: "kandinsky-community/kandinsky-2.2",
  15: "lucidrains/stylegan2-pokemon",
  16: "cjwbw/vintage-style",
  17: "aws-pony/magic-style",
  18: "upscayl/upscayl-enhance",
  19: "tencentarc/gfpgan",
  20: "yisol/anime-pose",
  21: "lambdal/text-to-pokemon",
  22: "p1atdev/ghibli-style",
  23: "gmgiorgi/monet-style",
  24: "cjwbw/sketch2anime",
  25: "brianandrew/arcane-style"
};

app.get("/", (req, res) => {
  res.send("✅ Nobita AnimeGAN API is working!");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const modelNumber = parseInt(req.query.modelNumber);

  if (!imageUrl || !modelNumber || !modelMap[modelNumber]) {
    return res.status(400).json({
      error: "Missing or invalid 'imageUrl' or 'modelNumber' (1-25)."
    });
  }

  const modelVersion = modelMap[modelNumber];

  try {
    const output = await runModel(imageUrl, modelVersion);
    res.json({ imageUrl: output });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
