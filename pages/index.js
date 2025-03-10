import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { AiOutlineCloudUpload } from "react-icons/ai";

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState(""); // Correct uploaded image URL
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for file input

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const response = await fetch("/api/get-all");
      if (!response.ok) throw new Error("Failed to fetch images");
  
      const data = await response.json();
      const formattedImages = data.images.map((img) => {
        const id = img.split("/").pop().replace(/\.[^/.]+$/, ""); // Extract filename without extension
        return `https://anipic.vercel.app/api/${id}`;
      });
  
      setImages(formattedImages);
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

      const id = res.data.id; // Extract image ID
      const shortUrl = `https://anipic.vercel.app/api/${id}`;
      setImages([...images, shortUrl]);
      setUploadedUrl(shortUrl); // Show correct uploaded image URL
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
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold">AniPic</h1>
        <p className="text-gray-400">Upload and manage your images effortlessly</p>
      </header>
      <Toaster />
      <div className="w-full max-w-lg p-4 bg-gray-900 rounded-xl shadow-md flex flex-col gap-4">
        {/* Drag and Drop Box */}
        <div
          className="border-2 border-dashed border-gray-500 p-8 rounded-lg text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()} // Open file manager on click
        >
          {imageFile ? (
            <p className="text-green-400">{imageFile.name}</p>
          ) : (
            <div>
              <AiOutlineCloudUpload className="mx-auto text-4xl text-gray-500 mb-2" />
              <p>Click or Drag & Drop an image here</p>
            </div>
          )}
        </div>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

        {/* URL Input Field */}
        <input
          type="text"
          className="p-2 rounded bg-gray-800 border border-gray-600"
          placeholder="Paste image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {/* Upload Button */}
        <button
          className="w-full bg-red-600 p-2 rounded-md hover:bg-red-500 transition"
          onClick={uploadImage}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {/* Show Uploaded Image URL */}
        {uploadedUrl && (
          <div className="bg-gray-800 p-2 rounded-md text-center">
            <p className="text-green-400 text-sm">{uploadedUrl}</p>
            <button
              className="text-blue-400 text-sm underline"
              onClick={() => copyToClipboard(uploadedUrl)}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
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
