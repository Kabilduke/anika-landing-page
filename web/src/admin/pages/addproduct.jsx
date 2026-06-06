import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import back from "../../assets/admin/back.png";
import "./addproduct.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  sku: "",
  category_id: "",
  price: "",
  compare_price: "",
  discount_price: "",
  stock: "",
  stock_alert: "",
  material: "",
  weight: "",
  sizes: "",
  colors: "",
  care: "",
};

// ── Image Upload to Supabase Storage ──────────────────────────
const uploadProductImage = async (file, productName) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${productName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return { error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
};

// ── Compress Image Before Upload ──────────────────────────────
const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: "image/webp",
            })
          );
        },
        "image/webp",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
};

export default function AddProduct({ onBack, onPublish, onSaveDraft, initialData }) {
  const isEditing = !!initialData;

  const [form, setForm] = useState(() =>
    initialData
      ? {
          name: initialData.name || "",
          description: initialData.description || "",
          sku: initialData.sku || "",
          category_id: initialData.category_id || "",
          price: initialData.price || "",
          compare_price: initialData.compare_price || "",
          discount_price: initialData.discount_price || "",
          stock: initialData.stock || "",
          stock_alert: initialData.stock_alert || "",
          material: initialData.material || "",
          weight: initialData.weight || "",
          sizes: initialData.sizes?.join(", ") || "",
          colors: initialData.colors?.join(", ") || "",
          care: initialData.care || "",
        }
      : EMPTY_FORM
  );

  const [images, setImages] = useState(initialData?.images || []);
  const [rawFiles, setRawFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [visibility, setVisibility] = useState([
    initialData?.is_active ?? false,
    initialData?.is_featured ?? false,
  ]);

  const fileRef = useRef();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("category_id, name")
        .eq("is_active", true)
        .order("sort_order");

      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        sku: initialData.sku || "",
        category_id: initialData.category_id || "",
        price: initialData.price || "",
        compare_price: initialData.compare_price || "",
        discount_price: initialData.discount_price || "",
        stock: initialData.stock || "",
        stock_alert: initialData.stock_alert || "",
        material: initialData.material || "",
        weight: initialData.weight || "",
        sizes: initialData.sizes?.join(", ") || "",
        colors: initialData.colors?.join(", ") || "",
        care: initialData.care || "",
      });
      setImages(initialData.images || []);
      setRawFiles([]);
      setVisibility([initialData.is_active ?? false, initialData.is_featured ?? false]);
    } else {
      setForm(EMPTY_FORM);
      setImages([]);
      setRawFiles([]);
      setVisibility([false, false]);
    }
  }, [initialData]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const addFiles = (newFiles) => {
    const filesArray = Array.from(newFiles).slice(0, 6 - rawFiles.length);
    const previewUrls = filesArray.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...previewUrls].slice(0, 6));
    setRawFiles((prev) => [...prev, ...filesArray].slice(0, 6));
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setRawFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleVis = (i) =>
    setVisibility((v) => v.map((val, idx) => (idx === i ? !val : val)));

  // ── Upload All Images to Supabase ────────────────────────────
  const uploadAllImages = async () => {
    if (rawFiles.length === 0) return { urls: images, error: null };

    setUploading(true);
    const uploadedUrls = [];
    const remainingOldUrls = images.filter(
      (_, i) => i < images.length - rawFiles.length
    );

    for (const file of rawFiles) {
      const compressed = await compressImage(file);
      const { url, error } = await uploadProductImage(
        compressed,
        form.name || "product"
      );

      if (error) {
        setUploading(false);
        return { urls: [], error };
      }

      uploadedUrls.push(url);
    }

    setUploading(false);
    return { urls: [...remainingOldUrls, ...uploadedUrls], error: null };
  };

  // ── Save Product to Database ─────────────────────────────────
  const saveProduct = async (status) => {
    const { urls, error: uploadError } = await uploadAllImages();
    if (uploadError) {
      alert("Failed to upload images: " + uploadError.message);
      return { error: uploadError };
    }

    const productData = {
      name: form.name,
      description: form.description,
      sku: form.sku,
      category_id: parseInt(form.category_id) || null,
      price: parseFloat(form.price) || 0,
      compare_price: parseFloat(form.compare_price) || null,
      discount_price: parseFloat(form.discount_price) || null,
      stock: parseInt(form.stock) || 0,
      stock_alert: parseInt(form.stock_alert) || null,
      material: form.material,
      weight: parseFloat(form.weight) || null,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : null,
      colors: form.colors ? form.colors.split(",").map((c) => c.trim()) : null,
      care: form.care,
      image_url: urls[0] || null,
      images: urls,
      is_active: visibility[0],
      is_featured: visibility[1],
    };

    if (isEditing) {
      // Update existing product
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("product_id", initialData.product_id)
        .select();

      if (error) {
        alert("Update failed: " + error.message);
        return { error };
      }

      return { data: data[0], error: null };
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select();

      if (error) {
        alert("Insert failed: " + error.message);
        return { error };
      }

      return { data: data[0], error: null };
    }
  };

  const handlePublish = async () => {
    const result = await saveProduct("Visible");
    if (!result.error && onPublish) onPublish(result.data);
  };

  const handleDraft = async () => {
    const result = await saveProduct("Draft");
    if (!result.error && onSaveDraft) onSaveDraft(result.data);
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="ap-header">
        <button className="back-btn" onClick={onBack}>
          <img src={back} alt="Back" />
        </button>
        <h1>{isEditing ? "Edit Product" : "Add Product"}</h1>
      </div>

      {/* ── Name & Description ── */}
      <div className="card">
        <div className="card-title">Name &amp; description</div>
        <div className="field">
          <label>Product Name</label>
          <input
            placeholder="Input your text"
            value={form.name}
            onChange={set("name")}
          />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            placeholder=""
            value={form.description}
            onChange={set("description")}
          />
        </div>
        <div className="row-2">
          <div className="field">
            <label>SKU</label>
            <input
              placeholder="Product Type"
              value={form.sku}
              onChange={set("sku")}
            />
            <div className="auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.category_id}
              onChange={set("category_id")}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Price & Stock ── */}
      <div className="card">
        <div className="card-title">Price &amp; Stock</div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Price (₹)</label>
            <input
              placeholder="Eg: 2000"
              value={form.price}
              onChange={set("price")}
            />
          </div>
          <div className="field">
            <label>Compare-at Price (₹)</label>
            <input
              placeholder="Eg: 2000"
              value={form.compare_price}
              onChange={set("compare_price")}
            />
          </div>
          <div className="field">
            <label>Discount Price (₹)</label>
            <input
              placeholder="Eg: 2000"
              value={form.discount_price}
              onChange={set("discount_price")}
            />
          </div>
        </div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Stock Quantity</label>
            <input
              placeholder="Eg: 3"
              value={form.stock}
              onChange={set("stock")}
            />
          </div>
          <div className="field">
            <label>Minimum Stock Alert</label>
            <input
              placeholder="Eg: 3"
              value={form.stock_alert}
              onChange={set("stock_alert")}
            />
          </div>
          <div />
        </div>

        <div className="auto-hint">Auto Generated Or Enter Manually</div>
      </div>

      {/* ── Product Details ── */}
      <div className="card">
        <div className="card-title">Product Details</div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Material</label>
            <input
              placeholder="Eg: Cotton"
              value={form.material}
              onChange={set("material")}
            />
          </div>
          <div className="field">
            <label>Weight</label>
            <input
              placeholder="Eg: 200g"
              value={form.weight}
              onChange={set("weight")}
            />
          </div>
          <div className="field">
            <label>Size / Dimensions</label>
            <input
              placeholder="Eg: 30x20cm"
              value={form.sizes}
              onChange={set("sizes")}
            />
          </div>
        </div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Colors</label>
            <input
              placeholder="Eg: Red, Green, Blue"
              value={form.colors}
              onChange={set("colors")}
            />
          </div>
          <div className="field">
            <label>Care Instructions</label>
            <input
              placeholder="Eg: Avoid water"
              value={form.care}
              onChange={set("care")}
            />
            <div className="auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          <div />
        </div>
      </div>

      {/* ── Product Images ── */}
      <div className="card">
        <div className="card-title">Product Images</div>
        <div
          className={`drop-zone ${uploading ? "uploading" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <div className="drop-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Uploading..." : "Click or drop image"}
          </div>
          <div className="drop-hint">
            SVG or WEBP • Max 2 MB each • Up to 5 Images
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="thumbs">
          {images.map((src, i) => (
            <div key={i} className="thumb-wrapper">
              <img src={src} className="thumb" alt="" />
              <button
                className="thumb-del"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          {images.length === 0 && <div className="thumb-placeholder" />}
          {images.length < 6 && !uploading && (
            <div
              className="add-thumb"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current.click();
              }}
            >
              +
            </div>
          )}
        </div>
        <div className="thumb-hint">
          First image will be used as thumbnail. Drag to reorder.
        </div>
      </div>

      {/* ── Visibility Options ── */}
      <div className="card">
        <div className="card-title">Visibility Options</div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Show On Store</div>
            <div className="toggle-sub">
              Product will be visible to customers
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibility[0]}
              onChange={() => toggleVis(0)}
            />
            <span className="slider" />
          </label>
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Featured Product</div>
            <div className="toggle-sub">
              Show in featured collections on home page
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibility[1]}
              onChange={() => toggleVis(1)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="ap-footer">
        <button
          type="button"
          className="btn-draft"
          onClick={handleDraft}
          disabled={uploading}
        >
          {isEditing ? "Save Changes as Draft" : "cancel"}
        </button>
        <button
          type="button"
          className="btn-publish"
          onClick={handlePublish}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : isEditing ? "Update Product" : "save"}
        </button>
      </div>
    </div>
  );
}