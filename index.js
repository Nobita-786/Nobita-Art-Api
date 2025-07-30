const express = require("express");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const app = express();
app.use(express.json());

async function downloadAndUploadAnimeImage(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream("anime_output.png");
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream("anime_output.png"));

  const upload = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders()
  });

  return upload.data;
}

app.post("/anime", async (req, res) => {
  try {
    const { image_url } = req.body;

    const prediction = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "animegan-model-version-id",
        input: { image: image_url }
      },
      {
        headers: {
          Authorization: `Token YOUR_REPLICATE_API_KEY`,
          "Content-Type": "application/json"
        }
      }
    );

    const outputUrl = prediction.data?.urls?.get;
    const finalResult = await axios.get(outputUrl, {
      headers: { Authorization: `Token YOUR_REPLICATE_API_KEY` }
    });

    const animeImageUrl = finalResult.data?.output[0];
    const permanentUrl = await downloadAndUploadAnimeImage(animeImageUrl);

    res.json({ anime_image_url: permanentUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate anime image" });
  }
});

app.listen(3000, () => console.log("AnimeGAN API running on port 3000"));
