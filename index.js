import express from "express";
import cors from "cors";
import Replicate from "replicate";

const app = express();
app.use(cors());

const replicate = new Replicate({
  auth: "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi", // apna key lagao
});

const models = [
  { model: "tstramer/animegan", version: "db21e45e...9e2d6d0" }, // 1
  { model: "cjwbw/animeganv2", version: "ed9aa08e...33e9ad7" }, // 2
  { model: "lambdal/text-to-pokemon", version: "291...b20" }, // 3
  { model: "catacolabs/anime-style", version: "3d9...f6c" }, // 4
  { model: "jingyunliang/swinir", version: "v3d6...x93" }, // 5
  { model: "cagliostrolab/animediff", version: "a34...a4e" }, // 6
  { model: "deepset/roberta", version: "v2" }, // 7
  { model: "tencentarc/gfpgan", version: "v1.4" }, // 8
  { model: "naruto/animegan-naruto", version: "v1" }, // 9
  { model: "ghibli/anime-style", version: "v1" }, // 10
  { model: "rembg/removal", version: "v1" }, // 11
  { model: "stability-ai/sdxl", version: "v1" }, // 12
  { model: "facefusion/facefusion", version: "v1.3.1" }, // 13
  { model: "timothybrooks/instruct-pix2pix", version: "v1" }, // 14
  { model: "stability-ai/stable-diffusion", version: "v1" }, // 15
  { model: "nitrosocke/arcane-diffusion", version: "v1" }, // 16
  { model: "nitrosocke/redshift-diffusion", version: "v1" }, // 17
  { model: "prompthero/openjourney", version: "v1" }, // 18
  { model: "nitrosocke/toonify", version: "v1" }, // 19
  { model: "meinamayhem/ghostmix", version: "v1" }, // 20
  { model: "dreamlike-art/dreamlike-diffusion", version: "v1" }, // 21
  { model: "civitai/realistic-vision", version: "v1" }, // 22
  { model: "hakurei/waifu-diffusion", version: "v1.4" }, // 23
  { model: "stablediffusionapi/anything-v5", version: "v1" }, // 24
  { model: "hakurei/waifu-diffusion", version: "v1.3" }, // 25
];

app.get("/", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const modelNumber = parseInt(req.query.modelNumber);

  if (!imageUrl || isNaN(modelNumber) || modelNumber < 1 || modelNumber > 25) {
    return res.send("✅ Anime Art API is running by Raj");
  }

  try {
    const selected = models[modelNumber - 1];

    const output = await replicate.run(`${selected.model}:${selected.version}`, {
      input: { image: imageUrl },
    });

    res.json({ imageUrl: output });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to apply filter.");
  }
});

app.listen(3000, () => {
  console.log("✅ Anime Art API running on port 3000");
});
