✨ Author: Raj


---

🚀 Description

This is a custom Node.js API that uses Replicate AnimeGANv2 to convert real images into anime-style.
It’s designed to deploy easily on Render.com and be accessed like a real-time image conversion API.


---

🔧 How to Deploy on Render

1. Create Account on https://render.com


2. Click New Web Service → Connect GitHub or upload manually


3. Use the following settings:



Build Command:   npm install
Start Command:   node index.js


---

⚙️ Environment Variables

Set this in the Render environment settings:

REPLICATE_API_TOKEN=your_replicate_token_here

> Get your token from https://replicate.com/account




---
🙂

---

📤 How to Use the API

Send a POST request to /anime with JSON body:

{
  "image_url": "https://your-image-link.jpg"
}

You will receive a response with the anime image URL like:

{
  "anime_url": "https://replicate.delivery/pbxt/anime-image.jpg"
}


---

📌 Notes

The model used: tencentarc/animegan-v2

Make sure your image URL is publicly accessible

Use axios or Postman for testing



---

🔗 Credits

Made by Raj
📘 Facebook: facebook.com/rajd.25053


---
