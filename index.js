import express from "express";
import cors from "cors";
import Replicate from "replicate";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi", // Replace with your token if needed
});

const models = [
  "tencentarc/gfpgan", // 1
  "stability-ai/stable-diffusion", // 2
  "cjwbw/animeganv2", // 3
  "nitrosocke/portraitplus", // 4
  "deepset/roberta-base-squad2", // 5
  "andreasjansson/stable-diffusion-cartoon", // 6
  "kandinsky-community/kandinsky-2-2-decoder", // 7
  "zhoont/xformers-animegan", // 8
  "runwayml/stable-diffusion-v1-5", // 9
  "digiplay/pixel-animegan", // 10
  "roneneldan/anime-pencil-sketch", // 11
  "lucataco/ghibli-style", // 12
  "yunsik/anime-pastelgan", // 13
  "lucataco/naruto-anime-style", // 14
  "lucataco/anime-pixelart", // 15
  "lucataco/onepiece-animegan", // 16
  "lucataco/anime-lineart", // 17
  "lucataco/bleach-style", // 18
  "lucataco/ghibli-poster-style", // 19
  "lucataco/anime-manga", // 20
  "lucataco/spyxfamily", // 21
  "lucataco/jojo-style", // 22
  "lucataco/demon-slayer", // 23
  "lucataco/attack-on-titan", // 24
  "lucataco/tokyo-ghoul", // 25
];

app.get("/", (req, res) => {
  res.send("✅ Anime Art API is running by Raj");
});

app.get("/generate", async (req, res) => {
  const { imageUrl, modelNumber } = req.query;

  const index = parseInt(modelNumber) - 1;

  if (!imageUrl || isNaN(index) || index < 0 || index >= models.length) {
    return res.status(400).json({ error: "Invalid imageUrl or modelNumber" });
  }

  try {
    const output = await replicate.run(models[index], {
      input: { image: imageUrl },
    });

    // some models return array, some return string
    const result = Array.isArray(output) ? output[0] : output;

    return res.json({ imageUrl: result });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
