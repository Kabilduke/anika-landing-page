import React, { useState, useRef, useEffect } from "react";
import { variantService } from "../../../services/variantService";
import "./ProductVariant.css";

const COLOR_SWATCHES = [
  "#EF4444", // red
  "#F5A623", // orange
  "#E5C100", // yellow
  "#8B5E34", // brown
  "#8BC34A", // light green
  "#3C8B0A", // green
  "#8B2FC9", // purple
  "#C026D3", // magenta
  "#3B82F6", // blue
  "#2DD4BF", // teal
  "#A7F3D0", // pale green
  "#111827", // black
  "#9CA3AF", // gray
  "#E5E7EB", // light gray
  "#FFFFFF", // white
];

const FieldError = ({ children }) => (
  <div className="cmp-error">
    <svg className="cmp-error-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.3" />
      <line x1="7" y1="4" x2="7" y2="7.8" stroke="#DC2626" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.75" fill="#DC2626" />
    </svg>
    <span>{children}</span>
  </div>
);

const InfoHint = ({ children }) => (
  <div className="cmp-info-hint">
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#9CA3AF" strokeWidth="1.3" />
      <line x1="7" y1="6.2" x2="7" y2="10" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="4" r="0.75" fill="#9CA3AF" />
    </svg>
    <span>{children}</span>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    className={`cmp-toggle ${checked ? "cmp-toggle--on" : ""}`}
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
  >
    <span className="cmp-toggle-knob" />
  </button>
);

let variantSeq = 0;
const makeVariant = () => ({
  id: `v-${Date.now()}-${variantSeq++}`,
  sizeDimension: "",
  stockQuantity: "",
  minStockAlert: "",
  price: "",
  sellingPrice: "",
  color: COLOR_SWATCHES[0],
  sku: "",
  media: [],
});

const CreateMultipleProduct = ({
  categories = [],
  categoryName = "",
  categoryPath = [],
  onGoToRoot,
  onBreadcrumbClick,
  onBack,
  onSave,
  subcategoriesCache = {},
  onFetchSubcategories,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
//   const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const subcategories = subcategoriesCache[category] || [];

  const [variants, setVariants] = useState([makeVariant()]);
  const [showOnStore, setShowOnStore] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState(true);

  const [errors, setErrors] = useState({});
  const mediaInputRefs = useRef({});

  const [saving, setSaving] = useState(false);

  useEffect(() =>{
    
    if (subcategoriesCache[category]) return;

    const fetchSubcategories = async () =>{
      setLoadingSubcategories(true);
      try{
        await onFetchSubcategories?.(category);
      } catch (err){
        console.error("Failed to load subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    fetchSubcategories();
  }, [category, subcategoriesCache, onFetchSubcategories]);

  const clearFieldError = (variantId, field) => {
    setErrors((prev) => {
      const variantErrors = prev[variantId];
      if (!variantErrors || !variantErrors[field]) return prev;
      const nextVariantErrors = { ...variantErrors };
      delete nextVariantErrors[field];
      return { ...prev, [variantId]: nextVariantErrors };
    });
  };

  const clearTopError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateVariant = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
    clearFieldError(id, field);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, makeVariant()]);
  };

  const handleRemoveVariant = (id) => {
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.id !== id) : prev));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleMediaSelect = (variantId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, media: [...v.media, ...next] } : v))
    );
    e.target.value = "";
  };

  const handleRemoveMedia = (variantId, mediaId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, media: v.media.filter((m) => m.id !== mediaId) }
          : v
      )
    );
  };

  const validate = () => {
    const topErrors = {};
    if (!title.trim()) topErrors.title = ["Title Cannot Be Empty"];
    if (!description.trim()) topErrors.description = ["Description Cannot Be Empty"];

    const variantErrors = {};
    variants.forEach((v) => {
      const fieldErrors = {};

      if (v.sizeDimension === "" || v.sizeDimension === null) {
        fieldErrors.sizeDimension = ["Cant Be Empty"];
      }
      if (v.stockQuantity === "" || v.stockQuantity === null) {
        fieldErrors.stockQuantity = ["Cant Be Empty"];
      }
      if (v.minStockAlert === "" || v.minStockAlert === null) {
        fieldErrors.minStockAlert = ["Cant Be Empty"];
      }
      if (v.price === "" || v.price === null) {
        fieldErrors.price = ["Cant Be Empty"];
      }

      const sellingPriceInvalid =
        v.sellingPrice === "" ||
        v.sellingPrice === null ||
        (v.price !== "" && Number(v.sellingPrice) > Number(v.price));
      if (sellingPriceInvalid) {
        fieldErrors.sellingPrice = ["Cant Be Higher Than Price", "Cant Be Empty"];
      }

      if (Object.keys(fieldErrors).length) {
        variantErrors[v.id] = fieldErrors;
      }
    });

    setErrors({ ...topErrors, ...variantErrors });
    return Object.keys(topErrors).length === 0 && Object.keys(variantErrors).length === 0;
  };

//   const handleSave = () => {
//     if (!validate()) return;
//     const categoryObj = categories.find((c) => (c.category_id ?? c.id) === category);
//     const subCategoryObj = subcategories.find((s) => s.subcategory_id === subCategory);

//     onSave?.({
//       title,
//       description,
//       category_id: category,
//       category_name: categoryObj?.name,
//       subcategory_id: subCategory || null,
//       subcategory_name: subCategoryObj?.name,
//       variants,
//       showOnStore,
//       featuredProduct,
//     });
//   };
  const handleSave = async () =>{
    if (!validate()) return;

    const productData = {
      name: title,
      description,
      category_id: parseInt(category) || null,
      subcategory_id: subCategory || null,
      is_active: showOnStore,
      is_featured: featuredProduct,
    };

    setSaving(true);
    try {
      const result = await variantService.createProductWithVariants(productData, variants);
      onSave?.(result);
    } catch (err){
      console.error("Failed to save variant product:", err);
      alert("Failed to save product: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
        <main className="dashboard-content cmp-page">
          <div className="cmp-header">
            <div>
              <h1 className="cmp-title">Create Multiple Product</h1>
              <div className="cmp-breadcrumb">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onGoToRoot? onGoToRoot() : onBack?.();
                  }}
                >
                  All Categories
                </a>
                {categoryPath.map((c, idx) => (
                  <React.Fragment key={`${c.id ?? "crumb"}-${idx}`}>
                    <span className="cmp-breadcrumb-sep">›</span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onBreadcrumbClick?.(idx);
                      }}
                    >
                      {c.name}
                    </a>
                  </React.Fragment>
                ))}
                <span className="cmp-breadcrumb-sep">›</span>
                <span className="cmp-breadcrumb-current">Create Multiple Product</span>
              </div>
            </div>

            <button type="button" className="cmp-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Title / Description / Category / Sub Category */}
          <div className="cmp-card">
            <label className="cmp-field">
              <span className="cmp-label">Title</span>
              <input
                type="text"
                className={`cmp-input${errors.title ? " cmp-input--error" : ""}`}
                placeholder="Necklace"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearTopError("title");
                }}
              />
              {errors.title?.map((msg) => (
                <FieldError key={msg}>{msg}</FieldError>
              ))}
            </label>

            <label className="cmp-field">
              <span className="cmp-label">Description</span>
              <textarea
                className={`cmp-textarea${errors.description ? " cmp-input--error" : ""}`}
                placeholder="Enter Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearTopError("description");
                }}
              />
              {errors.description?.map((msg) => (
                <FieldError key={msg}>{msg}</FieldError>
              ))}
            </label>

            <div className="cmp-row">
              <label className="cmp-field">
                <span className="cmp-label">Category</span>
                <select
                  className="cmp-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory("");
                  }}
                >
                  <option value="">Select Your Category</option>
                  {categories.map((c) => (
                    <option key={c.category_id ?? c.name} value={c.category_id ?? c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="cmp-field">
                <span className="cmp-label">Sub Category</span>
                <select
                  className="cmp-select"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!category || loadingSubcategories || subcategories.length === 0}
                >
                  <option value="">
                    {loadingSubcategories ? "Loading…" : "Select Your Sub Category"}
                  </option>
                  {subcategories.map((sc) =>(
                    <option key={sc.subcategory_id} value={sc.subcategory_id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
                {category && !loadingSubcategories && subcategories.length === 0 && (
                  <InfoHint>Sub Category Not Found</InfoHint>
                )}
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="cmp-card">
            <span className="cmp-section-title">Variants</span>

            {variants.map((v, idx) => {
              const vErrors = errors[v.id] || {};
              return (
                <div className="cmp-variant" key={v.id}>
                  <div className="cmp-variant-row">
                    <label className="cmp-field">
                      <span className="cmp-label">Size/Dimension</span>
                      <input
                        type="text"
                        className={`cmp-input${vErrors.sizeDimension ? " cmp-input--error" : ""}`}
                        placeholder="Size"
                        value={v.sizeDimension}
                        onChange={(e) => updateVariant(v.id, "sizeDimension", e.target.value)}
                      />
                      {vErrors.sizeDimension?.map((msg) => (
                        <FieldError key={msg}>{msg}</FieldError>
                      ))}
                    </label>

                    <label className="cmp-field">
                      <span className="cmp-label">Stock Quantity</span>
                      <input
                        type="text"
                        className={`cmp-input${vErrors.stockQuantity ? " cmp-input--error" : ""}`}
                        placeholder="0"
                        value={v.stockQuantity}
                        onChange={(e) => updateVariant(v.id, "stockQuantity", e.target.value)}
                      />
                      {vErrors.stockQuantity?.map((msg) => (
                        <FieldError key={msg}>{msg}</FieldError>
                      ))}
                    </label>

                    <label className="cmp-field">
                      <span className="cmp-label">Minimum Stock Alert</span>
                      <input
                        type="text"
                        className={`cmp-input${vErrors.minStockAlert ? " cmp-input--error" : ""}`}
                        placeholder="0"
                        value={v.minStockAlert}
                        onChange={(e) => updateVariant(v.id, "minStockAlert", e.target.value)}
                      />
                      {vErrors.minStockAlert?.map((msg) => (
                        <FieldError key={msg}>{msg}</FieldError>
                      ))}
                    </label>

                    <label className="cmp-field">
                      <span className="cmp-label">MRP Price</span>
                      <input
                        type="text"
                        className={`cmp-input${vErrors.price ? " cmp-input--error" : ""}`}
                        placeholder="₹0.00"
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, "price", e.target.value)}
                      />
                      {vErrors.price?.map((msg) => (
                        <FieldError key={msg}>{msg}</FieldError>
                      ))}
                    </label>

                    <label className="cmp-field">
                      <span className="cmp-label">Price</span>
                      <input
                        type="text"
                        className={`cmp-input${vErrors.sellingPrice ? " cmp-input--error" : ""}`}
                        placeholder="₹0.00"
                        value={v.sellingPrice}
                        onChange={(e) => updateVariant(v.id, "sellingPrice", e.target.value)}
                      />
                      {vErrors.sellingPrice?.map((msg) => (
                        <FieldError key={msg}>{msg}</FieldError>
                      ))}
                    </label>
                  </div>

                  <div className="cmp-variant-row cmp-variant-row--color-sku">
                    <div className="cmp-field">
                      <span className="cmp-label">Color</span>
                      <div className="cmp-color-grid">
                        {COLOR_SWATCHES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`cmp-color-swatch${
                              v.color === c ? " cmp-color-swatch--selected" : ""
                            }${c === "#FFFFFF" ? " cmp-color-swatch--white" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => updateVariant(v.id, "color", c)}
                            aria-label={`Select color ${c}`}
                          >
                            {v.color === c && (
                              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                <path
                                  d="M1 5L4.2 8.2L11 1"
                                  stroke={c === "#FFFFFF" ? "#111827" : "#fff"}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="cmp-field">
                      <span className="cmp-label">Sku</span>
                      <input
                        type="text"
                        className="cmp-input"
                        placeholder="Input your text"
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                      />
                      <span className="cmp-hint">Auto Generated Or Enter Manually</span>
                    </label>
                  </div>

                  <div className="cmp-variant-row cmp-variant-row--media">
                    <div className="cmp-media-row">
                      <button
                        type="button"
                        className="cmp-media-add"
                        onClick={() => mediaInputRefs.current[v.id]?.click()}
                        aria-label="Add media"
                      >
                        +
                      </button>
                      <input
                        ref={(el) => (mediaInputRefs.current[v.id] = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => handleMediaSelect(v.id, e)}
                      />
                      {v.media.map((m) => (
                        <div className="cmp-media-thumb" key={m.id}>
                          <img src={m.url} alt="Variant media" />
                          <button
                            type="button"
                            className="cmp-media-remove"
                            onClick={() => handleRemoveMedia(v.id, m.id)}
                            aria-label="Remove image"
                          >
                            &#10005;
                          </button>
                        </div>
                      ))}
                    </div>

                    {idx > 0 && (
                      <button
                        type="button"
                        className="cmp-delete-btn"
                        onClick={() => handleRemoveVariant(v.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M12.5 4.5l-.6 8.4a1.5 1.5 0 0 1-1.5 1.4H5.6a1.5 1.5 0 0 1-1.5-1.4l-.6-8.4"
                            stroke="#DC2626"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>

                  <InfoHint>
                    Chosen Size / Color Must Be Different From The Previous Variant.
                  </InfoHint>
                </div>
              );
            })}

            <button type="button" className="cmp-add-variant-btn" onClick={handleAddVariant}>
              <span className="cmp-add-variant-plus">+</span> Add variants
            </button>
          </div>

          {/* Visibility Options */}
          <div className="cmp-card">
            <span className="cmp-section-title">Visibility Options</span>

            <div className="cmp-visibility-row">
              <div>
                <div className="cmp-visibility-title">Show On Store</div>
                <div className="cmp-visibility-desc">
                  Product will be visible to customers
                </div>
              </div>
              <Toggle checked={showOnStore} onChange={setShowOnStore} />
            </div>

            <div className="cmp-visibility-row">
              <div>
                <div className="cmp-visibility-title">Featured product</div>
                <div className="cmp-visibility-desc">
                  Show in featured collections on home page
                </div>
              </div>
              <Toggle checked={featuredProduct} onChange={setFeaturedProduct} />
            </div>
          </div>
        </main>
  );
};

export default CreateMultipleProduct;