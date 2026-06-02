import React, { useState, useRef, useEffect } from "react";
import back from "../assets/back.png";
import "./addproduct.css";

const EMPTY_FORM = {
  name: "", description: "", sku: "", category: "",
  price: "", comparePrice: "", discountPrice: "",
  stock: "", stockQty: "",
  material: "", weight: "", size: "", care: "",
};

export default function AddProduct({ onBack, onPublish, onSaveDraft, initialData }) {
  const isEditing = !!initialData;

  const [form, setForm] = useState(() =>
    initialData
      ? {
          name:          initialData.name          || "",
          description:   initialData.description   || "",
          sku:           initialData.sku            || "",
          category:      initialData.category       || "",
          price:         initialData.price          || "",
          comparePrice:  initialData.comparePrice   || "",
          discountPrice: initialData.discountPrice  || "",
          stock:         initialData.stock          || "",
          stockQty:      initialData.stockQty       || "",
          material:      initialData.material       || "",
          weight:        initialData.weight         || "",
          size:          initialData.size           || "",
          care:          initialData.care           || "",
        }
      : EMPTY_FORM
  );

  const [images, setImages]         = useState(initialData?.images || []);
  const [visibility, setVisibility] = useState([
    initialData?.visible  ?? false,
    initialData?.featured ?? false,
  ]);

  const fileRef = useRef();

  useEffect(() => {
    if (initialData) {
      setForm({
        name:          initialData.name          || "",
        description:   initialData.description   || "",
        sku:           initialData.sku            || "",
        category:      initialData.category       || "",
        price:         initialData.price          || "",
        comparePrice:  initialData.comparePrice   || "",
        discountPrice: initialData.discountPrice  || "",
        stock:         initialData.stock          || "",
        stockQty:      initialData.stockQty       || "",
        material:      initialData.material       || "",
        weight:        initialData.weight         || "",
        size:          initialData.size           || "",
        care:          initialData.care           || "",
      });
      setImages(initialData.images || []);
      setVisibility([initialData.visible ?? false, initialData.featured ?? false]);
    } else {
      setForm(EMPTY_FORM);
      setImages([]);
      setVisibility([false, false]);
    }
  }, [initialData]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const addFiles = (files) => {
    const urls = Array.from(files)
      .slice(0, 6 - images.length)
      .map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls].slice(0, 6));
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const toggleVis   = (i)   => setVisibility((v) => v.map((val, idx) => idx === i ? !val : val));

  const buildProductData = (status) => ({
    ...(isEditing ? { id: initialData.id } : { id: Date.now() }),
    ...form,
    images,
    visible: visibility[0],
    featured: visibility[1],
    status,
  });

  const handlePublish = () => { if (onPublish) onPublish(buildProductData("Visible")); };
  const handleDraft   = () => { if (onSaveDraft) onSaveDraft(buildProductData("Draft")); };

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="header">
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
          <input placeholder="Input your text" value={form.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea placeholder="" value={form.description} onChange={set("description")} />
        </div>
        <div className="row-2">
          <div className="field">
            <label>SKU</label>
            <input placeholder="Product Type" value={form.sku} onChange={set("sku")} />
            <div className="auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={set("category")}>
              <option value="">Product Type</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Home</option>
              <option>Sports</option>
              <option>Rings</option>
              <option>Earrings</option>
              <option>Necklaces</option>
              <option>Bracelets</option>
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
            <input placeholder="Eg: 2000" value={form.price} onChange={set("price")} />
          </div>
          <div className="field">
            <label>Compare-at Price (₹)</label>
            <input placeholder="Eg: 2000" value={form.comparePrice} onChange={set("comparePrice")} />
          </div>
          <div className="field">
            <label>Discount Price (₹)</label>
            <input placeholder="Eg: 2000" value={form.discountPrice} onChange={set("discountPrice")} />
          </div>
        </div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Stock Quantity</label>
            <input placeholder="Eg: 3" value={form.stock} onChange={set("stock")} />
          </div>
          <div className="field">
            <label>Minimum Stock Alert</label>
            <input placeholder="Eg: 3" value={form.stockQty} onChange={set("stockQty")} />
          </div>
          {/* empty third cell — hidden by CSS */}
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
            <input placeholder="Eg: Cotton" value={form.material} onChange={set("material")} />
          </div>
          <div className="field">
            <label>Weight</label>
            <input placeholder="Eg: 200g" value={form.weight} onChange={set("weight")} />
          </div>
          <div className="field">
            <label>Size / Dimensions</label>
            <input placeholder="Eg: 30x20cm" value={form.size} onChange={set("size")} />
          </div>
        </div>

        <div className="grid3-wrap">
          <div className="field">
            <label>Care Instructions</label>
            <input placeholder="Eg: Avoid water" value={form.care} onChange={set("care")} />
            <div className="auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          {/* empty cells hidden by CSS */}
          <div />
          <div />
        </div>
      </div>

      {/* ── Product Images ── */}
      <div className="card">
        <div className="card-title">Product Images</div>
        <div
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <div className="drop-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Click or drop image
          </div>
          <div className="drop-hint">JPG, PNG or WEBP • Max 2 MB each • Up to 6 Images</div>
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
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                title="Remove image"
              >×</button>
            </div>
          ))}
          {images.length === 0 && <div className="thumb-placeholder" />}
          {images.length < 6 && (
            <div
              className="add-thumb"
              onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
            >+</div>
          )}
        </div>
        <div className="thumb-hint">First image will be used as thumbnail. Drag to reorder.</div>
      </div>

      {/* ── Visibility Options ── */}
      <div className="card">
        <div className="card-title">Visibility Options</div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Show On Store</div>
            <div className="toggle-sub">Product will be visible to customers</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={visibility[0]} onChange={() => toggleVis(0)} />
            <span className="slider" />
          </label>
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Featured Product</div>
            <div className="toggle-sub">Show in featured collections on home page</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={visibility[1]} onChange={() => toggleVis(1)} />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="footer">
        <button type="button" className="btn-draft" onClick={handleDraft}>
          {isEditing ? "Save Changes as Draft" : "cancel"}
        </button>
        <button type="button" className="btn-publish" onClick={handlePublish}>
          {isEditing ? "Update Product" : "save"}
        </button>
      </div>

    </div>
  );
}