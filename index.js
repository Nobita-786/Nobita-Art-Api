import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Nobita AnimeGAN API is working!");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) return res.status(400).send("❌ Error: imageUrl is required");

  try {
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "d998ef1cfa0c9c192311540cf59df67d6a548eab61a3f41b5e61bdaac0110993",
        input: { image: imageUrl }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const prediction = response.data;
    const getUrl = prediction.urls.get;

    let result;
    while (true) {
      const poll = await axios.get(getUrl, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`
        }
      });

      result = poll.data;

      if (result.status === "succeeded") break;
      if (result.status === "failed") return res.status(500).send("❌ Generation failed.");
      await new Promise(r => setTimeout(r, 1500));
    }

    return res.json({ output: result.output });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ Error: Failed to process image.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
