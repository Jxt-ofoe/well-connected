"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/categories").then(setCategories).catch(console.error);
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
      setName("");
      setImage(null);
      apiFetch("/categories").then(setCategories);
    } catch (err) {
      setError("Failed to upload category");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-categories-page">
      <h2>Manage Categories</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Category"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <div className="category-list">
        {categories.map((cat) => (
          <div key={cat.id} className="category-item">
            <strong>{cat.name}</strong>
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.name} style={{ width: 80, height: 80, objectFit: "cover" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
