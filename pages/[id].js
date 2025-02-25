import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const REPO_OWNER = "Otakuflix";
const REPO_NAME = "HOST";
const IMAGE_FOLDER = "images";

export default function ImagePage() {
  const router = useRouter();
  const { id } = router.query;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchImage = async () => {
      try {
        const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${IMAGE_FOLDER}/${id}.png`;
        await axios.get(url); // Ensure the image exists
        setImageUrl(url);
      } catch (error) {
        console.error("Image fetch error:", error.response?.data || error);
        setImageUrl(null);
      }
    };

    fetchImage();
  }, [id]);

  if (imageUrl === null) {
    return <h1>404 - Image Not Found</h1>;
  }

  return imageUrl ? <img src={imageUrl} alt="Uploaded Image" /> : null;
}
