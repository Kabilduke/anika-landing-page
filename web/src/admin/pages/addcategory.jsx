import React, { useState, useRef, useEffect } from "react";
import back from "../../assets/admin/back.png";
import "./addproduct.css";

/* ─── All styles scoped under .ap-page to prevent conflicts with global CSS ─── */
const FA_CSS = `
.ap-fa-top-card {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 14px 16px;
}
.ap-fa-section-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}
.ap-fa-empty-hint {
  font-size: 13px;
  color: #bbb;
  padding: 4px 0;
}
.ap-fa-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ap-fa-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #f4f4f4;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
}
.ap-fa-tag--group { background: #f9f9f9; }
.ap-fa-tag-remove {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  color: #999;
  display: flex;
  align-items: center;
}
.ap-fa-tag-remove:hover { color: #e55; }
.ap-fa-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}
.ap-fa-groups-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  line-height: 1.4;
}
.ap-fa-groups-count {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  padding-top: 2px;
}
.ap-fa-empty-groups {
  font-size: 13px;
  color: #bbb;
  text-align: center;
  padding: 20px 0 8px;
}
.ap-fa-group-card {
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fff;
}
.ap-fa-group-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.ap-fa-group-title-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  background: #fafafa;
  outline: none;
}
.ap-fa-group-title-input:focus { border-color: #aaa; }
.ap-fa-group-title-input::placeholder { font-weight: 400; color: #bbb; }
.ap-fa-delete-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #fcc;
  border-radius: 10px;
  background: #fff5f5;
  color: #e55;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.ap-fa-delete-btn:hover { background: #ffe0e0; }
.ap-fa-input-row {
  display: flex;
  gap: 8px;
}
.ap-fa-option-input {
  flex: 1;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 13px;
  color: #333;
  background: #fafafa;
  outline: none;
}
.ap-fa-option-input:focus { border-color: #aaa; }
.ap-fa-confirm-btn {
  height: 42px;
  padding: 0 18px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.ap-fa-confirm-btn:hover { background: #333; }
.ap-fa-add-group-btn {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 13px 0;
  border: 1.5px dashed #d0d0d0;
  border-radius: 12px;
  background: transparent;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.ap-fa-add-group-btn:hover { border-color: #888; color: #111; }

/* ─── Category Images ─── */
.ap-ci-preview-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 4px 0 2px;
}
.ap-ci-preview-thumb {
  width: 220px;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  flex-shrink: 0;
  background: #f5f5f5;
}
.ap-ci-preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ap-ci-preview-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding-top: 6px;
}
.ap-ci-preview-filename {
  font-size: 13.5px;
  font-weight: 600;
  color: #1c1c1e;
  word-break: break-all;
}
.ap-ci-preview-info {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}
.ap-ci-preview-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.ap-ci-preview-edit {
  padding: 5px 18px;
  background: #eff6ff;
  color: #3b82f6;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.ap-ci-preview-edit:hover { background: #dbeafe; }
.ap-ci-preview-delete {
  padding: 5px 18px;
  background: #fff0f0;
  color: #ef4444;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.ap-ci-preview-delete:hover { background: #fee2e2; }
.ap-ci-hint {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}
.ap-ci-storefront-title {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-top: 24px;
  margin-bottom: 14px;
}
.ap-ci-storefront-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.ap-ci-storefront-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.ap-ci-storefront-thumb {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  background: #ebebeb;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 1.5px dashed transparent;
  transition: border-color 0.15s;
}
.ap-ci-storefront-thumb:hover { border-color: #bbb; }
.ap-ci-storefront-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ap-ci-storefront-add {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  background: #f0f0f0;
  border: 1.5px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #aaa;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.ap-ci-storefront-add:hover { border-color: #888; color: #555; }
.ap-ci-storefront-label {
  font-size: 12px;
  color: #555;
  text-align: center;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ap-ci-storefront-hint {
  font-size: 12px;
  color: #888;
  margin-top: 10px;
}
.ap-ci-storefront-del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.ap-ci-storefront-thumb:hover .ap-ci-storefront-del { opacity: 1; }

/* ─── Page layout ─── */
.ap-page {
  padding: 0 24px 40px;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}
.ap-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0 16px;
  background: transparent;
  color: inherit;
}
.ap-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.ap-back-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.ap-back-btn img { width: 16px; height: 16px; }
.ap-card {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 16px;
  padding: 20px 20px 16px;
  margin-bottom: 16px;
}
.ap-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin-bottom: 16px;
}
.ap-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.ap-field label {
  font-size: 12.5px;
  font-weight: 600;
  color: #555;
}
.ap-field input,
.ap-field select,
.ap-field textarea {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 13px;
  color: #333;
  background: #fafafa;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}
.ap-field input:focus,
.ap-field select:focus,
.ap-field textarea:focus { border-color: #aaa; }
.ap-field textarea {
  height: 90px;
  padding: 10px 14px;
  resize: vertical;
}
.ap-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.ap-grid3-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
.ap-auto-hint {
  font-size: 11.5px;
  color: #aaa;
  margin-top: 4px;
}
.ap-drop-zone {
  border: 1.5px dashed #d0d0d0;
  border-radius: 12px;
  padding: 28px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
  background: #fafafa;
}
.ap-drop-zone:hover { border-color: #999; }
.ap-drop-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 9px;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  pointer-events: none;
}
.ap-drop-hint {
  font-size: 12px;
  color: #aaa;
}
.ap-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.ap-thumb-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
}
.ap-thumb {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e8e8e8;
}
.ap-thumb-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333;
  color: #fff;
  border: none;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ap-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.ap-toggle-row:last-child { border-bottom: none; }
.ap-toggle-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #111;
}
.ap-toggle-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.ap-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.ap-toggle input { opacity: 0; width: 0; height: 0; }
.ap-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ddd;
  border-radius: 24px;
  transition: background 0.2s;
}
.ap-slider:before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.ap-toggle input:checked + .ap-slider { background: #111; }
.ap-toggle input:checked + .ap-slider:before { transform: translateX(20px); }
.ap-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 0 8px;
  margin-top: 8px;
  border-top: 1px solid #ebebeb;
  background: transparent;
}
.ap-btn-draft {
  padding: 10px 22px;
  border: 1.5px solid #d0d0d0;
  border-radius: 10px;
  background: #fff;
  font-size: 13.5px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}
.ap-btn-draft:hover { background: #f5f5f5; }
.ap-btn-publish {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  background: #111;
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.ap-btn-publish:hover { background: #333; }
`;

/* inject scoped styles once */
if (typeof document !== "undefined" && !document.getElementById("ap-styles")) {
  const tag = document.createElement("style");
  tag.id = "ap-styles";
  tag.textContent = FA_CSS;
  document.head.appendChild(tag);
}

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

const EMPTY_FORM = {
  name: "", description: "", sku: "", category: "",
  price: "", comparePrice: "", discountPrice: "",
  stock: "", stockQty: "",
  material: "", weight: "", size: "", care: "",
};

const EMPTY_GROUP = (id) => ({ id, title: "", options: [], inputVal: "" });

// ─── Filter Attributes Section ────────────────────────────────────────────────

function FilterAttributesSection({ filters, setFilters, groups, setGroups }) {
  const [filterInput, setFilterInput] = useState("");

  const addFilter = () => {
    const v = filterInput.trim();
    if (v && !filters.includes(v)) setFilters((f) => [...f, v]);
    setFilterInput("");
  };
  const removeFilter = (tag) => setFilters((f) => f.filter((t) => t !== tag));

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
      {/* Top Filters card */}
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
                  <button className="ap-fa-tag-remove" onClick={() => removeFilter(tag)} title="Remove">×</button>
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
            <div className="ap-card-title" style={{ marginBottom: 2 }}>Custom filter groups</div>
            <div className="ap-fa-groups-sub">
              Create your own filter groups and add options inside each one. Shoppers will see these as filters on the category page.
            </div>
          </div>
          {groups.length > 0 && (
            <div className="ap-fa-groups-count">
              {groups.length} {groups.length === 1 ? "group" : "groups"} · {totalOptions} options
            </div>
          )}
        </div>

        {groups.length === 0 && (
          <div className="ap-fa-empty-groups">No custom filter groups yet. Click "Add new filter group" to create one.</div>
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
              <button className="ap-fa-delete-btn" onClick={() => removeGroup(grp.id)} title="Delete group">
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
                    <button className="ap-fa-tag-remove" onClick={() => removeOption(grp.id, opt)} title="Remove">×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="ap-fa-section-label" style={{ marginBottom: 6 }}>Select one after adding option</div>
            <div className="ap-fa-input-row">
              <input
                className="ap-fa-option-input"
                placeholder="Add an option e.g. Gold"
                value={grp.inputVal}
                onChange={(e) => updateGroup(grp.id, { inputVal: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && confirmOption(grp)}
              />
              <button className="ap-fa-confirm-btn" onClick={() => confirmOption(grp)}>Confirm</button>
            </div>
          </div>
        ))}

        <button className="ap-fa-add-group-btn" onClick={addGroup}>+ Add new filter group</button>
      </div>
    </>
  );
}

// ─── Category Images Section ──────────────────────────────────────────────────

function CategoryImagesSection({
  categoryImage, setCategoryImage,
  categoryImageMeta, setCategoryImageMeta,
  storefrontImages, setStorefrontImages,
  categoryName, isEditing,
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
            <div className="ap-ci-preview-filename">{categoryImageMeta?.name || "category-image"}</div>
            {categoryImageMeta && (
              <div className="ap-ci-preview-info">
                Uploaded {timeAgo(categoryImageMeta.uploadedAt)} · {categoryImageMeta.width}×{categoryImageMeta.height}px · {formatSize(categoryImageMeta.size)}
              </div>
            )}
            <div className="ap-ci-preview-actions">
              <button className="ap-ci-preview-edit" onClick={() => mainDropRef.current.click()}>Edit</button>
              <button className="ap-ci-preview-delete" onClick={() => { setCategoryImage(null); setCategoryImageMeta(null); }}>Delete</button>
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
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
                >×</button>
              </div>
            </div>
          )}
        </>
      )}

      <input ref={mainDropRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleMainFileChange} />

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
              >×</button>
            </div>
            <span className="ap-ci-storefront-label">{previewLabel}</span>
          </div>
        ))}
        {storefrontImages.length < 6 && (
          <div className="ap-ci-storefront-item">
            <div className="ap-ci-storefront-add" onClick={() => storefrontInputRef.current.click()} title="Add storefront image">+</div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const toggleVis = (i) => setVisibility((v) => v.map((val, idx) => (idx === i ? !val : val)));

  const buildProductData = (status) => ({
    ...(isEditing ? { id: initialData.id } : { id: Date.now() }),
    name: form.name, description: form.description,
    sku: form.sku, category: form.category,
    price: form.price, comparePrice: form.comparePrice, discountPrice: form.discountPrice,
    stock: form.stock, stockQty: form.stockQty,
    material: form.material, weight: form.weight, size: form.size, care: form.care,
    categoryImage, categoryImageMeta, storefrontImages,
    visible: visibility[0], featured: visibility[1], status,
    filters, filterGroups,
  });

  const handlePublish = () => { if (onPublish) onPublish(buildProductData("Visible")); };
  const handleDraft   = () => { if (onSaveDraft) onSaveDraft(buildProductData("Draft")); };

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
          <label>Product Name</label>
          <input placeholder="Input your text" value={form.name} onChange={set("name")} />
        </div>
        <div className="ap-field">
          <label>Description</label>
          <textarea placeholder="" value={form.description} onChange={set("description")} />
        </div>
        <div className="ap-row-2">
          <div className="ap-field">
            <label>Sku</label>
            <input placeholder="Product Type" value={form.sku} onChange={set("sku")} />
            <div className="ap-auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          <div className="ap-field">
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
      <div className="ap-card">
        <div className="ap-card-title">Price &amp; Stock</div>
        <div className="ap-grid3-wrap">
          <div className="ap-field">
            <label>Price (₹)</label>
            <input style={inputBase} placeholder="Eg: 2000" value={form.price} onChange={set("price")} />
          </div>
          <div className="ap-field">
            <label>Compare-at Price (₹)</label>
            <input style={inputBase} placeholder="Eg: 2000" value={form.comparePrice} onChange={set("comparePrice")} />
          </div>
          <div className="ap-field">
            <label>Discount Price (₹)</label>
            <input style={inputBase} placeholder="Eg: 2000" value={form.discountPrice} onChange={set("discountPrice")} />
          </div>
        </div>
        <div className="ap-grid3-wrap">
          <div className="ap-field">
            <label>Stock Quantity</label>
            <input style={inputBase} placeholder="Eg: 3" value={form.stock} onChange={set("stock")} />
          </div>
          <div className="ap-field">
            <label>Minimum Stock Alert</label>
            <input style={inputBase} placeholder="Eg: 3" value={form.stockQty} onChange={set("stockQty")} />
          </div>
          <div />
        </div>
        <div className="ap-auto-hint">Auto Generated Or Enter Manually</div>
      </div>

      {/* ── Product Details ── */}
      <div className="ap-card">
        <div className="ap-card-title">Product Details</div>
        <div className="ap-grid3-wrap">
          <div className="ap-field">
            <label>Material</label>
            <input style={inputBase} placeholder="Eg: Cotton" value={form.material} onChange={set("material")} />
          </div>
          <div className="ap-field">
            <label>Weight</label>
            <input style={inputBase} placeholder="Eg: 200g" value={form.weight} onChange={set("weight")} />
          </div>
          <div className="ap-field">
            <label>Size / Dimensions</label>
            <input style={inputBase} placeholder="Eg: 30x20cm" value={form.size} onChange={set("size")} />
          </div>
        </div>
        <div className="ap-grid3-wrap">
          <div className="ap-field">
            <label>Care Instructions</label>
            <input style={inputBase} placeholder="Eg: Avoid water" value={form.care} onChange={set("care")} />
            <div className="ap-auto-hint">Auto Generated Or Enter Manually</div>
          </div>
          <div /><div />
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
      <div>
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
            <div className="ap-toggle-sub">Product will be visible to customers</div>
          </div>
          <label className="ap-toggle">
            <input type="checkbox" checked={visibility[0]} onChange={() => toggleVis(0)} />
            <span className="ap-slider" />
          </label>
        </div>
        <div className="ap-toggle-row">
          <div>
            <div className="ap-toggle-label">Featured product</div>
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
          {isEditing ? "Update Product" : "Publish now"}
        </button>
      </div>

    </div>
  );
}