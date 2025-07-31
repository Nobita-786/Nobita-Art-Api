const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

module.exports = async function runModel(imageUrl, modelVersion) {
  const prediction = await replicate.run(modelVersion, {
    input: { image: imageUrl }
  });
  return prediction;
};
