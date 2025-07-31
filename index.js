const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());

const apiKey = "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi"; // Tumhara Replicate key

const models = {
  1: "AnimePremiumV2",
  2: "CartoonPremium",
  3: "MaidOutfit",
  4: "BeachBabe",
  5: "SweetFantasy",
  6: "LoveStoryComic",
  7: "HighSchoolMemories",
  8: "FestiveChristmas",
  9: "PirateAdventure",
  10: "PopStarSensation",
  11: "NinjaLegacy",
  12: "SuperWarriors",
  13: "DarkNotebook",
  14: "EternalBattle",
  15: "WingsOfDestiny",
  16: "MysticMagic",
  17: "TennisProdigy",
  18: "DemonSlayerChronicles",
  19: "AlchemicalAdventures",
  20: "HeroicFuture",
  21: "PrehistoricQuest",
  22: "CourtClash",
  23: "GhibliV1",
  24: "GhibliV2",
  25: "Webtoon"
};

app.get("/", (req, res) => {
  res.send("✅ Anime Art API is running by Raj");
});

app.get("/generate", async (req, res) => {
  try {
    const { imageUrl, modelNumber } = req.query;
    if (!imageUrl || !modelNumber || !models[modelNumber]) {
      return res.status(400).json({ error: "Invalid imageUrl or modelNumber" });
    }

    const modelName = models[modelNumber];
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "f5ad62d0c942739c9aeb7c1e29d0f45f29f6a9981cd2088a7c1d6f0ea490aa63",
        input: {
          image: imageUrl,
          model: modelName
        }
      },
      {
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const getUrl = response.data?.urls?.get;
    if (!getUrl) return res.status(500).json({ error: "Failed to start processing" });

    let outputImage = null;
    for (let i = 0; i < 20; i++) {
      const statusRes = await axios.get(getUrl, {
        headers: { Authorization: `Token ${apiKey}` }
      });
      if (statusRes.data.status === "succeeded") {
        outputImage = statusRes.data.output;
        break;
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!outputImage) return res.status(500).json({ error: "Image processing timed out" });
    res.json({ imageUrl: outputImage });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Anime API by Raj running on port ${PORT}`));
