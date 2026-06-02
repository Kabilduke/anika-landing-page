import React, { useState, useRef } from "react";
import "./Addbanner.css";

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const AddBanner = ({ onBack, onPublish, initialData }) => {
  const [title, setTitle]         = useState(initialData?.title || "");
  const [tagline, setTagline]     = useState(initialData?.tagline || "");
  const [linkUrl, setLinkUrl]     = useState(initialData?.linkUrl || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || "");
  const [target, setTarget]       = useState(initialData?.target || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate]     = useState(initialData?.endDate || "");
  const [isActive, setIsActive]   = useState(initialData?.isActive ?? false);
  const [previewImage, setPreviewImage] = useState(initialData?.image || null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleDiscard = () => {
    if (onBack) onBack();
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish({
        title,
        tagline,
        linkUrl,
        displayOrder,
        target,
        startDate,
        endDate,
        isActive,
        image: previewImage,
        status: isActive ? "Active" : "Inactive",
      });
    } else {
      if (onBack) onBack();
    }
  };

  return (
    <div className="ab">
      {/* Header */}
      <div className="ab__header">
        <button className="ab__back-btn" onClick={onBack} aria-label="Go back">
          <BackIcon />
        </button>
        <h1 className="ab__title">Add Banner</h1>
      </div>

      <div className="ab__body">
        {/* Banner Title */}
        <div className="ab__section">
          <label className="ab__label">Banner Title (Internal Reference)</label>
          <input
            className="ab__input"
            type="text"
            placeholder="Input your text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span className="ab__hint">Not visible to customers — used for admin identification only</span>
        </div>

        {/* Banner Tagline */}
        <div className="ab__section">
          <label className="ab__label">Banner tagline (optional)</label>
          <input
            className="ab__input"
            type="text"
            placeholder="Input your text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* Link URL */}
        <div className="ab__section">
          <label className="ab__label">Link URL (where banner taps/clicks go)</label>
          <input
            className="ab__input"
            type="text"
            placeholder="Input your text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>

        {/* Display Order + Target */}
        <div className="ab__row">
          <div className="ab__col">
            <label className="ab__label">Display Order</label>
            <input
              className="ab__input"
              type="text"
              placeholder="Input your text"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>
          <div className="ab__col">
            <label className="ab__label">Target</label>
            <div className="ab__select-wrapper">
              <select
                className="ab__select"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">Input your text</option>
                <option value="home">Home Page</option>
                <option value="category">Category Page</option>
                <option value="product">Product Page</option>
                <option value="external">External Link</option>
              </select>
              <svg className="ab__select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Category Images */}
        <div className="ab__section">
          <label className="ab__label">Category Images</label>
          <div
            className={`ab__upload-zone${isDragging ? " ab__upload-zone--dragging" : ""}${previewImage ? " ab__upload-zone--has-image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            {previewImage ? (
              <img src={previewImage} alt="Banner preview" className="ab__upload-preview" />
            ) : (
              <div className="ab__upload-placeholder">
                <div className="ab__upload-icon-wrap">
                  <UploadIcon />
                </div>
                <span className="ab__upload-text">Click or drop image</span>
                <span className="ab__upload-hint">JPG or PNG · Recommended 1200×400px (3:1 ratio) · Max 2MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={handleFileDrop}
            />
          </div>
        </div>

        {/* Validity & Scheduling */}
        <div className="ab__card">
          <h2 className="ab__card-title">Validity &amp; scheduling</h2>
          <div className="ab__row">
            <div className="ab__col">
              <label className="ab__label">Start Date</label>
              <div className="ab__date-wrapper">
                <input
                  className="ab__input ab__input--date"
                  type="text"
                  placeholder="Input your text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onFocus={(e) => { e.target.type = "date"; }}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                />
                <span className="ab__date-icon"><CalendarIcon /></span>
              </div>
            </div>
            <div className="ab__col">
              <label className="ab__label">End Date</label>
              <div className="ab__date-wrapper">
                <input
                  className="ab__input ab__input--date"
                  type="text"
                  placeholder="Input your text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onFocus={(e) => { e.target.type = "date"; }}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                />
                <span className="ab__date-icon"><CalendarIcon /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Options */}
        <div className="ab__card">
          <h2 className="ab__card-title">Visibility Options</h2>
          <div className="ab__visibility-row">
            <div className="ab__visibility-info">
              <span className="ab__visibility-label">Active — show on home page carousel</span>
              <span className="ab__visibility-sub">Currently live on storefront</span>
            </div>
            <button
              className={`ab__toggle${isActive ? " ab__toggle--on" : ""}`}
              onClick={() => setIsActive((v) => !v)}
              aria-label="Toggle active"
              type="button"
            >
              <span className="ab__toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Home Page Carousel Preview */}
        <div className="ab__section">
          <label className="ab__label">Home Page Carousal Preview</label>
          <div className="ab__preview-box">
            {previewImage ? (
              <img src={previewImage} alt="Carousel preview" className="ab__preview-img" />
            ) : (
              <div className="ab__preview-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Preview will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="ab__footer">
        <button className="ab__btn ab__btn--discard" onClick={handleDiscard}>Discard Banner</button>
        <button className="ab__btn ab__btn--publish" onClick={handlePublish}>Publish Banner</button>
      </div>
    </div>
  );
};

export default AddBanner;