// replicate.js
const axios = require("axios");
require("dotenv").config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function runModel(imageUrl, modelVersion) {
  const response = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version: modelVersion,
      input: { image: imageUrl }
    },
    {
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  const getUrl = response.data.urls.get;

  let result;
  while (true) {
    const res = await axios.get(getUrl, {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`
      }
    });

    if (res.data.status === "succeeded") {
      result = res.data.output;
      break;
    } else if (res.data.status === "failed") {
      throw new Error("Replicate model failed to process.");
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return result;
}

module.exports = runModel;
