import express from "express";
import dotenv from "dotenv";
import Replicate from "replicate";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get("/", (req, res) => {
  res.send("Anime Art API by Raj is running!");
});

app.get("/generate", async (req, res) => {
  const { imageUrl, modelNumber } = req.query;

  if (!imageUrl || !modelNumber) {
    return res.status(400).json({ error: "Missing imageUrl or modelNumber" });
  }

  try {
    const modelMap = {
      1: "tencentarc/animeganv2:31ce08835578ec96063b1b6da4fc0d27b144e51c01d122b24aaa15d705b3c327",
      2: "tstramer/cartoon-gan:ec2dc6d450ae15e2740e35df2a183d843be5ec62b318dfb5bfae574f5265869a",
      3: "naklecha/ghibli-gan:dc0c5e9dc96f2e58a46c4c6973a57c7f2ae8fa9bd6a6b09f50ff2bc04cbf32e7",
      4: "p1atdev/naruto-art:f92d5c7ed03cd91a86b4e6d4177b6a12c9a7ee54f5a88f7a9010a7b2c56c5f49",
      5: "fofr/animagine-xl:8c922aaf57e9ba53d54b8c9ff737f5d76f6b62e6e51c34b5a150c6de2b2767c0"
    };

    const selectedModel = modelMap[modelNumber];
    if (!selectedModel) {
      return res.status(400).json({ error: "Invalid model number" });
    }

    const prediction = await replicate.predictions.create({
      version: selectedModel,
      input: { image: imageUrl },
    });

    // Poll until image is ready
    let output = null;
    let retries = 0;
    while (!output && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wait
      const poll = await replicate.predictions.get(prediction.id);
      if (poll.status === "succeeded") {
        output = poll.output;
      } else if (poll.status === "failed") {
        return res.status(500).json({ error: "Image generation failed" });
      }
      retries++;
    }

    if (output) {
      res.json({ imageUrl: output });
    } else {
      res.status(408).json({ error: "Image generation timeout" });
    }

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
