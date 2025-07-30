const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

const replicateApiKey = "r8_HnKrKiaBeULPphI4kvAaAwVUFWa9cVP3F2IBi";
const modelVersion = "a9758cb3b371d51b2d6a72a1ff52b504308e9c4f508314985b98b16bda04890a"; // AnimeGANv2

app.get("/", (req, res) => {
  res.send("✅ AnimeGAN API is running");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl query" });

  try {
    // Send to Replicate
    const replicateResponse = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: modelVersion,
        input: { image: imageUrl }
      },
      {
        headers: {
          "Authorization": `Token ${replicateApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const getUrl = replicateResponse.data.urls.get;

    // Wait until processing done
    let outputUrl;
    for (let i = 0; i < 15; i++) {
      const statusResponse = await axios.get(getUrl, {
        headers: { Authorization: `Token ${replicateApiKey}` }
      });

      if (statusResponse.data.status === "succeeded") {
        outputUrl = statusResponse.data.output;
        break;
      }

      if (statusResponse.data.status === "failed") {
        return res.status(500).json({ error: "❌ Replicate failed to process image." });
      }

      await new Promise(r => setTimeout(r, 3000));
    }

    if (!outputUrl) {
      return res.status(500).json({ error: "❌ Timed out waiting for Replicate." });
    }

    // Download image locally
    const filename = `anime_${uuidv4()}.png`;
    const filepath = path.join(__dirname, filename);
    const writer = fs.createWriteStream(filepath);
    const imageStream = await axios.get(outputUrl, { responseType: "stream" });
    imageStream.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Upload to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filepath));

    const catboxUpload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(filepath); // cleanup local file

    res.json({ animeImage: catboxUpload.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to process image." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AnimeGAN API running on port ${PORT}`);
});
