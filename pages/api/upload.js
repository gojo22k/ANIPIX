import fs from "fs";
import path from "path";
import axios from "axios";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser for file handling
  },
};

// Multer setup to handle local file uploads
const upload = multer({ dest: "/tmp/uploads" });

// Generate a short unique alphanumeric ID (4 chars, ~1.6M combinations)
function generateShortId() {
  return Math.random().toString(36).slice(2, 6);
}

async function uploadToGitHub(base64Image, imageId) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.GITHUB_OWNER;
  const REPO_NAME = process.env.GITHUB_REPO;
  const FILE_PATH = `images/${imageId}.png`; // Use only short ID

  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

  try {
    const response = await axios.put(
      githubApiUrl,
      {
        message: `Uploaded ${imageId}.png`,
        content: base64Image,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.content.download_url;
  } catch (error) {
    console.error("GitHub Upload Error:", error.response?.data || error);
    throw new Error("Failed to upload image to GitHub");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    let base64Image = "";
    let imageId = generateShortId(); // Generate short unique ID

    if (req.headers["content-type"]?.includes("application/json")) {
      // 🔹 Manually parse JSON body when remote URL upload is used
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(buffers).toString());

      if (!body.imageUrl) {
        return res.status(400).json({ error: "No imageUrl provided" });
      }

      // Remote Upload (Downloading image from provided URL)
      const response = await axios.get(body.imageUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data);
      base64Image = buffer.toString("base64");
    } else {
      // Local Upload (Handling file upload)
      await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      base64Image = fileBuffer.toString("base64");
    }

    // Upload to GitHub
    const imageUrl = await uploadToGitHub(base64Image, imageId);

    return res.json({
      success: true,
      message: "Image uploaded successfully!",
      id: imageId, // Return short ID instead of full name
      url: imageUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}
