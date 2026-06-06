import React, { useState, useRef, useEffect } from "react";
import back from "../../assets/admin/back.png";
import "./addcategory.css";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  description: "",
  sku: "",
  category: "",
  price: "",
  comparePrice: "",
  discountPrice: "",
  stock: "",
  stockQty: "",
  material: "",
  weight: "",
  size: "",
  care: "",
};

const EMPTY_GROUP = (id) => ({ id, title: "", options: [], inputVal: "" });

const inputBase = {
  display: "block",
  width: "100%",
  height: "44px",
  paddingLeft: "18px",
  paddingRight: "18px",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  fontSize: "13px",
  color: "#333",
  background: "#fafafa",
  outline: "none",
  boxSizing: "border-box",
};

// ─────────────────────────────────────────────
// FilterAttributesSection
// ─────────────────────────────────────────────

function FilterAttributesSection({ filters, setFilters, groups, setGroups }) {
  const addGroup = () => setGroups((g) => [...g, EMPTY_GROUP(Date.now())]);
  const removeGroup = (id) => setGroups((g) => g.filter((grp) => grp.id !== id));

  const updateGroup = (id, patch) =>
    setGroups((g) => g.map((grp) => (grp.id === id ? { ...grp, ...patch } : grp)));

  const confirmOption = (grp) => {
    const v = grp.inputVal.trim();
    if (v && !grp.options.includes(v))
      updateGroup(grp.id, { options: [...grp.options, v], inputVal: "" });
    else updateGroup(grp.id, { inputVal: "" });
  };

  const removeOption = (grpId, opt) =>
    setGroups((g) =>
      g.map((grp) =>
        grp.id === grpId
          ? { ...grp, options: grp.options.filter((o) => o !== opt) }
          : grp
      )
    );

  const totalOptions = groups.reduce((s, g) => s + g.options.length, 0);

  return (
    <>
      {/* Filter tags card */}
      <div className="ap-card">
        <div className="ap-card-title">Filter attributes</div>
        <div className="ap-fa-top-card">
          <div className="ap-fa-section-label">Filters</div>
          {filters.length === 0 ? (
            <div className="ap-fa-empty-hint">No filters added yet</div>
          ) : (
            <div className="ap-fa-tag-row">
              {filters.map((tag) => (
                <span key={tag} className="ap-fa-tag">
                  {tag}
                  <button
                    className="ap-fa-tag-remove"
                    onClick={() => setFilters((f) => f.filter((t) => t !== tag))}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom filter groups card */}
      <div className="ap-card">
        <div className="ap-fa-groups-header">
          <div>
            <div className="ap-card-title" style={{ marginBottom: 2 }}>
              Custom filter groups
            </div>
            <div className="ap-fa-groups-sub">
              Create your own filter groups and add options inside each one.
              Shoppers will see these as filters on the category page.
            </div>
          </div>
          {groups.length > 0 && (
            <div className="ap-fa-groups-count">
              {groups.length} {groups.length === 1 ? "group" : "groups"} · {totalOptions} options
            </div>
          )}
        </div>

        {groups.length === 0 && (
          <div className="ap-fa-empty-groups">
            No custom filter groups yet. Click "Add new filter group" to create one.
          </div>
        )}

        {groups.map((grp) => (
          <div key={grp.id} className="ap-fa-group-card">
            <div className="ap-fa-group-title-row">
              <input
                className="ap-fa-group-title-input"
                placeholder="Group name e.g. Stone type"
                value={grp.title}
                onChange={(e) => updateGroup(grp.id, { title: e.target.value })}
              />
              <button
                className="ap-fa-delete-btn"
                onClick={() => removeGroup(grp.id)}
                title="Delete group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            {grp.options.length > 0 && (
              <div className="ap-fa-tag-row" style={{ marginBottom: 10 }}>
                {grp.options.map((opt) => (
                  <span key={opt} className="ap-fa-tag ap-fa-tag--group">
                    {opt}
                    <button
                      className="ap-fa-tag-remove"
                      onClick={() => removeOption(grp.id, opt)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="ap-fa-section-label" style={{ marginBottom: 6 }}>
              Select one after adding option
            </div>
            <div className="ap-fa-input-row">
              <input
                className="ap-fa-option-input"
                placeholder="Add an option e.g. Gold"
                value={grp.inputVal}
                onChange={(e) => updateGroup(grp.id, { inputVal: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && confirmOption(grp)}
              />
              <button className="ap-fa-confirm-btn" onClick={() => confirmOption(grp)}>
                Confirm
              </button>
            </div>
          </div>
        ))}

        <button className="ap-fa-add-group-btn" onClick={addGroup}>
          + Add new filter group
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CategoryImagesSection
// ─────────────────────────────────────────────

function CategoryImagesSection({
  categoryImage,
  setCategoryImage,
  categoryImageMeta,
  setCategoryImageMeta,
  storefrontImages,
  setStorefrontImages,
  categoryName,
  isEditing,
}) {
  const mainDropRef = useRef();
  const storefrontInputRef = useRef();

  const processFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCategoryImage(url);
    const img = new Image();
    img.onload = () => {
      setCategoryImageMeta({
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        uploadedAt: new Date(),
      });
    };
    img.src = url;
  };

  const handleMainDrop = (e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); };
  const handleMainFileChange = (e) => processFile(e.target.files[0]);

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
    const days = Math.floor(diff / 86400);
    return days + (days === 1 ? " day ago" : " days ago");
  };

  const handleStorefrontFiles = (files) => {
    const urls = Array.from(files)
      .slice(0, 6 - storefrontImages.length)
      .map((f) => URL.createObjectURL(f));
    setStorefrontImages((prev) => [...prev, ...urls].slice(0, 6));
  };

  const removeStorefrontImage = (idx) =>
    setStorefrontImages((prev) => prev.filter((_, i) => i !== idx));

  const previewLabel = categoryName?.trim() || "Category";

  return (
    <div className="ap-card">
      <div className="ap-card-title">Category Images</div>

      {isEditing && categoryImage ? (
        <div className="ap-ci-preview-row">
          <div className="ap-ci-preview-thumb">
            <img src={categoryImage} alt="Category" />
          </div>
          <div className="ap-ci-preview-meta">
            <div className="ap-ci-preview-filename">
              {categoryImageMeta?.name || "category-image"}
            </div>
            {categoryImageMeta && (
              <div className="ap-ci-preview-info">
                Uploaded {timeAgo(categoryImageMeta.uploadedAt)} ·{" "}
                {categoryImageMeta.width}×{categoryImageMeta.height}px ·{" "}
                {formatSize(categoryImageMeta.size)}
              </div>
            )}
            <div className="ap-ci-preview-actions">
              <button className="ap-ci-preview-edit" onClick={() => mainDropRef.current.click()}>
                Edit
              </button>
              <button
                className="ap-ci-preview-delete"
                onClick={() => { setCategoryImage(null); setCategoryImageMeta(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="ap-drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleMainDrop}
            onClick={() => mainDropRef.current.click()}
          >
            <div className="ap-drop-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Click or drop image
            </div>
            <div className="ap-drop-hint">JPG, PNG or WEBP • Max 2 MB each</div>
          </div>

          {categoryImage && (
            <div className="ap-thumbs" style={{ marginTop: 10 }}>
              <div className="ap-thumb-wrapper">
                <img src={categoryImage} className="ap-thumb" alt="Category" />
                <button
                  className="ap-thumb-del"
                  onClick={(e) => { e.stopPropagation(); setCategoryImage(null); setCategoryImageMeta(null); }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <input
        ref={mainDropRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleMainFileChange}
      />

      <div className="ap-ci-hint">
        This image appears in the category strip on the home page and on the category listing page.
      </div>

      <div className="ap-ci-storefront-title">Storefront Preview</div>
      <input
        ref={storefrontInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleStorefrontFiles(e.target.files)}
      />

      <div className="ap-ci-storefront-grid">
        {storefrontImages.map((src, i) => (
          <div key={i} className="ap-ci-storefront-item">
            <div className="ap-ci-storefront-thumb">
              <img src={src} alt={`storefront-${i}`} />
              <button
                className="ap-ci-storefront-del"
                onClick={(e) => { e.stopPropagation(); removeStorefrontImage(i); }}
                title="Remove"
              >
                ×
              </button>
            </div>
            <span className="ap-ci-storefront-label">{previewLabel}</span>
          </div>
        ))}

        {storefrontImages.length < 6 && (
          <div className="ap-ci-storefront-item">
            <div
              className="ap-ci-storefront-add"
              onClick={() => storefrontInputRef.current.click()}
              title="Add storefront image"
            >
              +
            </div>
            <span className="ap-ci-storefront-label">{previewLabel}</span>
          </div>
        )}
      </div>

      <div className="ap-ci-storefront-hint">
        Preview of how this category will appear in the home page category strip.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AddCategory (main export)
// ─────────────────────────────────────────────

export default function AddCategory({ onBack, onPublish, onSaveDraft, initialData }) {
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

  const [categoryImage, setCategoryImage]         = useState(initialData?.categoryImage || null);
  const [categoryImageMeta, setCategoryImageMeta] = useState(initialData?.categoryImageMeta || null);
  const [storefrontImages, setStorefrontImages]   = useState(initialData?.storefrontImages || []);
  const [visibility, setVisibility]               = useState([
    initialData?.visible  ?? false,
    initialData?.featured ?? false,
  ]);
  const [filters, setFilters]           = useState(initialData?.filters || []);
  const [filterGroups, setFilterGroups] = useState(initialData?.filterGroups || []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
      setCategoryImage(initialData.categoryImage || null);
      setCategoryImageMeta(initialData.categoryImageMeta || null);
      setStorefrontImages(initialData.storefrontImages || []);
      setVisibility([initialData.visible ?? false, initialData.featured ?? false]);
      setFilters(initialData.filters || []);
      setFilterGroups(initialData.filterGroups || []);
    } else {
      setForm(EMPTY_FORM);
      setCategoryImage(null);
      setCategoryImageMeta(null);
      setStorefrontImages([]);
      setVisibility([false, false]);
      setFilters([]);
      setFilterGroups([]);
    }
  }, [initialData]);

  const toggleVis = (i) =>
    setVisibility((v) => v.map((val, idx) => (idx === i ? !val : val)));

  const buildData = (status) => ({
    ...(isEditing ? { id: initialData.id } : { id: Date.now() }),
    name: form.name, description: form.description,
    sku: form.sku, category: form.category,
    price: form.price, comparePrice: form.comparePrice, discountPrice: form.discountPrice,
    stock: form.stock, stockQty: form.stockQty,
    material: form.material, weight: form.weight, size: form.size, care: form.care,
    categoryImage, categoryImageMeta, storefrontImages,
    visible: visibility[0], featured: visibility[1],
    status, filters, filterGroups,
  });

  const handlePublish = () => { if (onPublish) onPublish(buildData("Visible")); };
  const handleDraft   = () => { if (onSaveDraft) onSaveDraft(buildData("Draft")); };

  return (
    <div className="ap-page">

      {/* ── Header ── */}
      <div className="ap-header">
        <button className="ap-back-btn" onClick={onBack}>
          <img src={back} alt="Back" />
        </button>
        <h1>{isEditing ? "Edit Category" : "Add Category"}</h1>
      </div>

      {/* ── Name & Description ── */}
      <div className="ap-card">
        <div className="ap-card-title">Name &amp; description</div>
        <div className="ap-field">
          <label>Category Name</label>
          <input placeholder="Input your text" value={form.name} onChange={set("name")} />
        </div>
        <div className="ap-field">
          <label>Description</label>
          <textarea placeholder="Enter Description" value={form.description} onChange={set("description")} />
        </div>
        <div className="ap-row-2">
          <div className="ap-field">
            <label>Display Order</label>
            <input placeholder="Input your text" value={form.sku} onChange={set("sku")} />
            <div className="ap-auto-hint">Lower number appears first in the category strip</div>
          </div>
          <div className="ap-field">
            <label>Slug/URL</label>
            <input placeholder="Input your text" value={form.category} onChange={set("category")} />
            <div className="ap-auto-hint">Auto-generated from name — or optional</div>
          </div>
        </div>
      </div>

      {/* ── Category Images ── */}
      <CategoryImagesSection
        categoryImage={categoryImage}
        setCategoryImage={setCategoryImage}
        categoryImageMeta={categoryImageMeta}
        setCategoryImageMeta={setCategoryImageMeta}
        storefrontImages={storefrontImages}
        setStorefrontImages={setStorefrontImages}
        categoryName={form.name}
        isEditing={isEditing}
      />

      {/* ── Filter Attributes ── */}
      <div className="ap-fa-section-wrap">
        <FilterAttributesSection
          filters={filters}
          setFilters={setFilters}
          groups={filterGroups}
          setGroups={setFilterGroups}
        />
      </div>

      {/* ── Visibility Options ── */}
      <div className="ap-card">
        <div className="ap-card-title">Visibility Options</div>
        <div className="ap-toggle-row">
          <div>
            <div className="ap-toggle-label">Show On Store</div>
            <div className="ap-toggle-sub">Category will be visible to customers</div>
          </div>
          <label className="ap-toggle">
            <input type="checkbox" checked={visibility[0]} onChange={() => toggleVis(0)} />
            <span className="ap-slider" />
          </label>
        </div>
        <div className="ap-toggle-row">
          <div>
            <div className="ap-toggle-label">Featured category</div>
            <div className="ap-toggle-sub">Show in featured collections on home page</div>
          </div>
          <label className="ap-toggle">
            <input type="checkbox" checked={visibility[1]} onChange={() => toggleVis(1)} />
            <span className="ap-slider" />
          </label>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="ap-footer">
        <button type="button" className="ap-btn-draft" onClick={handleDraft}>
          {isEditing ? "Save Changes as Draft" : "Save Draft"}
        </button>
        <button type="button" className="ap-btn-publish" onClick={handlePublish}>
          {isEditing ? "Update Category" : "Publish now"}
        </button>
      </div>

    </div>
  );
}