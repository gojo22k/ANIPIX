import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await axios.get("/api/get-all");
      setImages(res.data.images);
    } catch (error) {
      console.error("Error fetching images", error);
    }
  }

  async function uploadImage() {
    if (!imageFile && !imageUrl) return toast.error("Please select an image or enter a URL");
    
    setLoading(true);
    let formData = new FormData();
    if (imageFile) formData.append("file", imageFile);
    
    try {
      const res = await axios.post("/api/upload", imageUrl ? { imageUrl } : formData, {
        headers: imageUrl ? { "Content-Type": "application/json" } : { "Content-Type": "multipart/form-data" },
      });
      setImages([...images, res.data.url]);
      toast.success("Image uploaded successfully");
      setImageFile(null);
      setImageUrl("");
    } catch (error) {
      toast.error("Upload failed");
    }
    setLoading(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setImageFile(event.dataTransfer.files[0]);
  }

  function handleFileChange(event) {
    setImageFile(event.target.files[0]);
  }

  function copyToClipboard(url) {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Image Uploader</h1>
      <div className="w-full max-w-lg p-4 bg-gray-900 rounded-xl shadow-md flex flex-col gap-4">
        <div
          className="border-2 border-dashed border-gray-500 p-8 rounded-lg text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {imageFile ? (
            <p className="text-green-400">{imageFile.name}</p>
          ) : (
            <p>Drag & Drop an image here</p>
          )}
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} />
        <input
          type="text"
          className="p-2 rounded bg-gray-800 border border-gray-600"
          placeholder="Paste image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button
          className="w-full bg-red-600 p-2 rounded-md hover:bg-red-500 transition"
          onClick={uploadImage}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        {images.map((img, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => copyToClipboard(img)}
          >
            <img src={img} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
