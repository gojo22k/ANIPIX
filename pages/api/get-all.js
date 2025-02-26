import axios from "axios";

export default async function handler(req, res) {
  console.log("🚀 Incoming request:", {
    method: req.method,
    query: req.query,
    headers: req.headers,
  });

  if (req.method !== "GET") {
    console.warn("❌ Invalid request method:", req.method);
    return res.status(405).json({ error: "Only GET method allowed" });
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO;
    const IMAGE_FOLDER = "images";

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      console.error("❌ Missing environment variables:", {
        GITHUB_TOKEN: !!GITHUB_TOKEN ? "✔️ Set" : "❌ Missing",
        REPO_OWNER: !!REPO_OWNER ? "✔️ Set" : "❌ Missing",
        REPO_NAME: !!REPO_NAME ? "✔️ Set" : "❌ Missing",
      });
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGE_FOLDER}`;
    console.log("🔗 Fetching from GitHub API:", githubApiUrl);

    const response = await axios.get(githubApiUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log("✅ GitHub API response:", response.status, response.statusText);

    if (!response.data || response.data.length === 0) {
      console.warn("⚠️ No images found in repository.");
      return res.json({ success: true, images: [] });
    }

    // Convert GitHub file names into URLs pointing to /[id]
    const imageUrls = response.data.map((file) => {
      const id = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      return `/${id}`; // Now pointing to your [id].js page
    });

    console.log("🖼️ Image URLs generated:", imageUrls);
    res.json({ success: true, images: imageUrls });

  } catch (error) {
    console.error("🔥 Error fetching images:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : "No response",
    });

    res.status(500).json({ error: "Failed to retrieve images" });
  }
}
