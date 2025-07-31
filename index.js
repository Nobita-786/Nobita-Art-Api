import express from "express";
import Replicate from "replicate";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const replicate = new Replicate({
  auth: "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi", // Tumhara Replicate API key
});

const modelList = [
  "naklezz/animegan-v2", // 0
  "tencentarc/gfpgan",   // 1
  "cjwbw/ghost-style",   // 2
  "tencentarc/stylegan-v", // 3
  "jingyunliang/style-swin", // 4
  "nateraw/ghibli-diffusion", // 5
  "lllyasviel/controlnet", // 6
  "deepset/roberta-base-squad2", // 7
  "ai-forever/kandinsky-2.1", // 8
  "stability-ai/sdxl", // 9
  "cjwbw/cartoon-style", // 10
  "lucataco/anime-pencil", // 11
  "lambdal/text-to-pokemon", // 12
  "zero-shots/backdrop-removal", // 13
  "monster-labs/anime-style", // 14
  "mehdidc/anime-diffusion", // 15
  "runwayml/stable-diffusion-v1-5", // 16
  "prompthero/openjourney", // 17
  "dreamlike-art/dreamlike-photoreal-2.0", // 18
  "stability-ai/stable-diffusion", // 19
  "fofr/sdxl-anime", // 20
  "fofr/anything-v3", // 21
  "t2i-adapter/anime", // 22
  "nerijs/pixel-art-xl", // 23
  "fofr/anime-portrait" // 24
];

app.get("/", (req, res) => {
  res.send("✅ Anime Art API is running by Raj");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const modelNumber = parseInt(req.query.modelNumber);

  if (!imageUrl || isNaN(modelNumber) || modelNumber < 0 || modelNumber >= modelList.length) {
    return res.status(400).json({ error: "Invalid imageUrl or modelNumber" });
  }

  const model = modelList[modelNumber];
  try {
    const output = await replicate.run(model, {
      input: {
        image: imageUrl
      }
    });

    // output may be array or string depending on model
    const imageLink = Array.isArray(output) ? output[0] : output;

    res.json({ imageUrl: imageLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
