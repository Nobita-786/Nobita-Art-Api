import express from "express";
import Replicate from "replicate";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 25 models list (sample models, tum actual replace kar sakte ho)
const models = [
  // 1–5 AnimeGAN-type
  "tencentarc/gfpgan", // 1
  "fofr/anything-v3.0", // 2
  "stability-ai/stable-diffusion", // 3
  "cjwbw/animegan-v2", // 4
  "lambdal/text-to-pokemon", // 5

  // 6–10 real-esrgan + cartoon styles
  "jingyunliang/swinir", // 6
  "nateraw/naifu", // 7
  "cjwbw/animegan", // 8
  "tstramer/malanya", // 9
  "lucataco/sd-ghibli", // 10

  // 11–15 more anime filters
  "lucataco/sd-naruto", // 11
  "lucataco/sd-onepiece", // 12
  "lucataco/sd-bleach", // 13
  "lucataco/sd-doraemon", // 14
  "lucataco/sd-bakugan", // 15

  // 16–20 stylized GANs
  "lucataco/sd-disney", // 16
  "lucataco/sd-totoro", // 17
  "lucataco/sd-pixar", // 18
  "lucataco/sd-minions", // 19
  "lucataco/sd-barbie", // 20

  // 21–25 creative
  "lucataco/sd-spiderman", // 21
  "lucataco/sd-animeboy", // 22
  "lucataco/sd-animegirl", // 23
  "lucataco/sd-horror", // 24
  "lucataco/sd-lovefilter", // 25
];

app.get("/", (req, res) => {
  res.send("✅ Anime Art API is running by Raj");
});

app.get("/art", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  const modelNumber = parseInt(req.query.modelNumber);

  if (!imageUrl || isNaN(modelNumber) || modelNumber < 1 || modelNumber > models.length) {
    return res.status(400).json({ error: "Invalid imageUrl or modelNumber (1–25 supported)" });
  }

  try {
    const modelId = models[modelNumber - 1];

    const output = await replicate.run(`${modelId}`, {
      input: {
        image: imageUrl,
      },
    });

    // Output could be array or string depending on model
    const resultUrl = Array.isArray(output) ? output[0] : output;

    res.json({
      status: "success",
      modelUsed: modelId,
      imageUrl: resultUrl,
    });
  } catch (err) {
    console.error("❌ Error processing image:", err.message);
    res.status(500).json({ error: "Image processing failed" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Anime Art API server running on port ${port}`);
});
