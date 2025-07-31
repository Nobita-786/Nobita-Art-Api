const express = require('express');
const runModel = require('./replicate');
const app = express();

app.get('/', (req, res) => {
  res.send('✅ Anime Art API is Live!');
});

app.get('/api/art', async (req, res) => {
  const { imageUrl, modelNumber } = req.query;

  if (!imageUrl || modelNumber === undefined) {
    return res.status(400).json({ error: "Missing imageUrl or modelNumber" });
  }

  const models = [
    "cjwbw/animegan",          // model 0
    "tencentarc/gfpgan",       // model 1
    "nitrosocke/arcane-diffusion", // model 2
    "nitrosocke/redshift-diffusion", // model 3
    "prompthero/openjourney",  // model 4
    "lambdal/text-to-pokemon", // model 5
    "stability-ai/stable-diffusion", // model 6
    "stability-ai/sdxl",       // model 7
    "andreasjansson/stylegan-t", // model 8
    "fofr/superresolution",    // model 9
    "fofr/repaint",            // model 10
    "lucataco/anime-line-art", // model 11
    "cjwbw/animeganv2",        // model 12
    "kvfrans/clipdraw",        // model 13
    "artificialguybr/art-to-pixel", // model 14
    "jingyunliang/swinir",     // model 15
    "thibaud/controlnet-openpose", // model 16
    "kandinsky-community/kandinsky-2-2", // model 17
    "monster-labs/controlnet-monster", // model 18
    "openai/whisper",          // model 19
    "cjwbw/cartoon",           // model 20
    "stability-ai/stable-diffusion-xl", // model 21
    "lokesh/anime2sketch",     // model 22
    "yuntian-deng/real-esrgan", // model 23
    "replicate/deepdanbooru",  // model 24
  ];

  const index = parseInt(modelNumber);
  const selectedModel = models[index];

  if (!selectedModel) {
    return res.status(400).json({ error: "Invalid model number." });
  }

  try {
    const result = await runModel(imageUrl, selectedModel);
    res.json({ imageUrl: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate image", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
