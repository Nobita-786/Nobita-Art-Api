const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const REPLICATE_API_TOKEN = "r8_7CKaIoEtChrCWUz08HFd3s6nkpAcZer1FHG9o"; // yahi tumhara token hai

app.get("/", (req, res) => {
  res.send("AnimeGANv2 API is running.");
});

app.get("/generate", async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl parameter" });

  try {
    const replicateResponse = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "0cfc4235d889c6f1f20942a0fb51d8be3cf408b5b5bbf9e380b032c0cf94f45b", // AnimeGANv2 version
        input: { image: imageUrl }
      },
      {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const prediction = replicateResponse.data;
    const getFinal = await waitUntilComplete(prediction.urls.get);
    const output = getFinal.output;

    if (!output) return res.status(500).json({ error: "Failed to get output" });
    res.json({ imageUrl: output });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Replicate API call failed" });
  }
});

// Helper: wait until output ready
async function waitUntilComplete(url) {
  while (true) {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`
      }
    });
    if (res.data.status === "succeeded") return res.data;
    if (res.data.status === "failed") throw new Error("Generation failed");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
