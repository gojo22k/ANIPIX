import axios from "axios";

const REPO_OWNER = "Otakuflix";
const REPO_NAME = "HOST";
const IMAGE_FOLDER = "images";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Image ID is required");
  }

  const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${IMAGE_FOLDER}/${id}.png`;

  try {
    const response = await axios.get(imageUrl, { responseType: "stream" });

    // Set headers to serve an actual image
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    // Stream the image directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.setHeader("Content-Type", "text/plain");
    return res.status(404).send("Image not found");
  }
}
