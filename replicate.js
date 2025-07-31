const axios = require("axios");

async function runModel(imageUrl, modelVersion) {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  const [owner, name] = modelVersion.split("/");

  const versionUrl = `https://api.replicate.com/v1/models/${owner}/${name}`;
  const versionResponse = await axios.get(versionUrl, {
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
    },
  });

  const version = versionResponse.data.latest_version.id;

  const prediction = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version,
      input: { image: imageUrl },
    },
    {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const getStatus = async (url) => {
    while (true) {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
      });
      if (res.data.status === "succeeded") return res.data.output;
      else if (res.data.status === "failed") throw new Error("Generation failed");
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  return await getStatus(prediction.data.urls.get);
}

module.exports = runModel;
