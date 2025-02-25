import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_OWNER;
const REPO_NAME = process.env.GITHUB_REPO;
const IMAGE_FOLDER = "images";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET method allowed" });
  }

  const { id } = req.query; // Get image ID from query

  if (!id) {
    return res.status(400).json({ error: "Image ID is required" });
  }

  try {
    const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${IMAGE_FOLDER}/${id}.png`;

    // Check if image exists
    await axios.get(imageUrl);

    return res.json({
      success: true,
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error fetching image:", error.response?.data || error);
    return res.status(404).json({ error: "Image not found" });
  }
}
