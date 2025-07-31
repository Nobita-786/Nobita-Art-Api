const express = require("express");
const runModel = require("./replicate");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Map of 25 model numbers to their Replicate model versions
const modelMap = {
  1: "cjwbw/animegan",
  2: "lucataco/naruto-gan",
  3: "fofr/counterfeit-v30",
  4: "naklecha/ghibli-vision",
  5: "tstramer/anime-style-transfer",
  6: "cjwbw/anything-v4",
  7: "tstramer/animegan-v2",
  8: "gsdf/Counterfeit-V2.5",
  9: "mrfantastic/mid-anime-style",
  10: "cjwbw/toonify",
  11: "fofr/portrait-plus",
  12: "lucataco/pokemon-generator",
  13: "ai-forever/kandinsky-2.1",
  14: "cjwbw/chibi-style",
  15: "openai/consistency-decoder",
  16: "runwayml/stable-diffusion-v1-5",
  17: "lucataco/onepiece-style",
  18: "fofr/shinkai-style",
  19: "tstramer/mangafan",
  20: "lucataco/ghibli-style-v2",
  21: "replicate/anything-v5",
  22: "lucataco/spyxfamily-vision",
  23: "naklecha/bleach-style",
  24: "lucataco/jujutsu-vibe",
  25: "cjwbw/anime-mix-v4"
};

app.get("/", (req, res) => {
  res.send("✅ Anime Art API with 25 Models is Running");
});

app.get("/art", async (req, res) => {
  const { imageUrl, modelNumber } = req.query;

  if (!imageUrl || !modelNumber) {
    return res.status(400).json({ error: "Missing imageUrl or modelNumber" });
  }

  const version = modelMap[modelNumber];

  if (!version) {
    return res.status(400).json({ error: "Invalid model number. Use 1 to 25" });
  }

  try {
    const outputUrl = await runModel(imageUrl, version);
    res.json({ imageUrl: outputUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
