import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET method allowed" });
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO;
    const IMAGE_FOLDER = "images";

    const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGE_FOLDER}`;
    const response = await axios.get(githubApiUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.data || response.data.length === 0) {
      return res.json({ success: true, images: [] });
    }

    // Convert GitHub file names into URLs pointing to /[id] instead of /api/raw
    const imageUrls = response.data.map((file) => {
      const id = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      return `/${id}`; // Now pointing to your [id].js page
    });

    res.json({ success: true, images: imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error.message);
    res.status(500).json({ error: "Failed to retrieve images" });
  }
}
