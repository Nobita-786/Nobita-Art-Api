import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const replicate_api = process.env.REPLICATE_API_TOKEN;

app.get("/", (req, res) => {
  res.send("🟢 Nobita Anime Art API is running!");
});

app.get("/generate", async (req, res) => {
  const { imageUrl, modelNumber } = req.query;

  if (!imageUrl || !modelNumber) {
    return res.status(400).json({ error: "Invalid imageUrl or modelNumber" });
  }

  const models = {
    1: "tencentarc/gfpgan",
    2: "stability-ai/stable-diffusion",
    3: "naklecha/animegan-v2",
    4: "kakaobrain/karlo-v1-alpha",
    5: "tstramer/animegan",
    6: "fofr/anything-v3.0",
    7: "fofr/anything-v4.0",
    8: "hysts/animegan2-pytorch:orange",
    9: "cjwbw/animeganv2",
    10: "lucataco/animegan",
    // ... up to 25 models if needed
  };

  const model = models[modelNumber];
  if (!model) return res.status(400).json({ error: "Invalid model number" });

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicate_api}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "latest",
        input: { image: imageUrl },
        model: model
      })
    });

    const data = await response.json();

    if (data.error) return res.status(500).json({ error: "Failed to process image" });

    const outputUrl = data?.urls?.get || data?.output;
    if (!outputUrl) return res.status(500).json({ error: "Output not ready" });

    return res.json({ imageUrl: outputUrl });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ API started on port ${port}`);
});
