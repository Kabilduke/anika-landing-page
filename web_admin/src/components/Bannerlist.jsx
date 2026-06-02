import React, { useState } from "react";
import "./Bannerlist.css";
import BannerEdit from "./Banneredit";
import blankIcon from "../assets/blank.svg";

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const statusConfig = {
  Active:    { className: "bl__badge--active",    label: "Active" },
  Scheduled: { className: "bl__badge--scheduled", label: "Scheduled" },
  Inactive:  { className: "bl__badge--inactive",  label: "Inactive" },
};

const BannerList = ({ banners = [], onAddBanner, onDeleteBanner }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerList, setBannerList] = useState(banners);

  const totalBanners  = bannerList.length;
  const activeNow     = bannerList.filter((b) => b.status === "Active").length;
  const scheduled     = bannerList.filter((b) => b.status === "Scheduled").length;
  const inactive      = bannerList.filter((b) => b.status === "Inactive").length;
  const activeBanners = bannerList.filter((b) => b.status === "Active");

  const handleDeleteClick = (id) => setDeleteConfirm(id);
  const handleDeleteConfirm = () => {
    const updated = bannerList.filter((b) => b.id !== deleteConfirm);
    setBannerList(updated);
    if (onDeleteBanner) onDeleteBanner(deleteConfirm);
    setDeleteConfirm(null);
  };

  const handleSave = (updatedBanner) => {
    setBannerList((prev) =>
      prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b))
    );
    setEditingBanner(null);
  };

  const handleDeleteFromEdit = (id) => {
    setBannerList((prev) => prev.filter((b) => b.id !== id));
    if (onDeleteBanner) onDeleteBanner(id);
    setEditingBanner(null);
  };

  // Show Edit page if a banner is selected
  if (editingBanner) {
    return (
      <BannerEdit
        banner={editingBanner}
        onBack={() => setEditingBanner(null)}
        onSave={handleSave}
        onDelete={handleDeleteFromEdit}
      />
    );
  }

  return (
    <div className="bl">
      {/* Page Header */}
      <div className="bl__header">
        <h1 className="bl__title">Banner &amp; Content</h1>
        <button className="bl__add-btn" onClick={onAddBanner}>
          <PlusIcon /> Add Banner
        </button>
      </div>

      {/* Stats Row */}
      <div className="bl__stats">
        <div className="bl__stat-card">
          <div className="bl__stat-label">Total Banners</div>
          <div className="bl__stat-value">{totalBanners}</div>
          <div className="bl__stat-sub">All Time</div>
        </div>
        <div className="bl__stat-card">
          <div className="bl__stat-label">Active Now</div>
          <div className="bl__stat-value">{activeNow}</div>
          <div className="bl__stat-sub">May 2026</div>
        </div>
        <div className="bl__stat-card">
          <div className="bl__stat-label">Scheduled</div>
          <div className="bl__stat-value">{scheduled}</div>
          <div className="bl__stat-sub">Upcoming</div>
        </div>
        <div className="bl__stat-card">
          <div className="bl__stat-label">Inactive</div>
          <div className="bl__stat-value">{inactive}</div>
          <div className="bl__stat-sub">Hidden</div>
        </div>
      </div>

      {/* Banner List */}
      <div className="bl__list">
        {bannerList.length === 0 ? (
          <div className="bl__empty">
            <img src={blankIcon} alt="No banners" className="bl__empty-icon" />
            <p>No banners yet. Click <strong>+ Add Banner</strong> to create one.</p>
          </div>
        ) : (
          bannerList.map((banner) => {
            const cfg = statusConfig[banner.status] || statusConfig.Inactive;
            return (
              <div key={banner.id} className="bl__card">
                <div className="bl__card-image">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} />
                  ) : (
                    <div className="bl__card-image-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="bl__card-info">
                  <div className="bl__card-top">
                    <span className="bl__card-title">{banner.title || "Untitled Banner"}</span>
                    <span className={`bl__badge ${cfg.className}`}>{cfg.label}</span>
                  </div>
                  {banner.linkUrl && (
                    <div className="bl__card-meta">Link: {banner.linkUrl}</div>
                  )}
                  <div className="bl__card-meta">
                    Uploaded: {banner.uploadedDate || "—"} &nbsp;·&nbsp; {banner.dimensions || "1200×400px"}
                  </div>
                  {(banner.startDate || banner.endDate) && (
                    <div className="bl__card-meta">
                      Validity: {banner.startDate || "—"} – {banner.endDate || "—"}
                    </div>
                  )}
                  <div className="bl__card-actions">
                    <button
                      className="bl__action-btn bl__action-btn--edit"
                      onClick={() => setEditingBanner(banner)}
                    >
                      Edit
                    </button>
                    <button
                      className="bl__action-btn bl__action-btn--delete"
                      onClick={() => handleDeleteClick(banner.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Carousel Preview */}
      {activeBanners.length > 0 && (
        <div className="bl__preview-section">
          <h2 className="bl__preview-title">Home Page Carousal Preview</h2>
          <CarouselPreview banners={activeBanners} />
          <p className="bl__preview-note">
            {activeBanners.length} Active Banner{activeBanners.length !== 1 ? "s" : ""} Rotate Every 4 Seconds
          </p>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="bl__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="bl__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="bl__modal-title">Delete Banner?</h3>
            <p className="bl__modal-text">This action cannot be undone.</p>
            <div className="bl__modal-actions">
              <button className="bl__modal-btn bl__modal-btn--cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="bl__modal-btn bl__modal-btn--delete" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Carousel Preview ──────────────────────────────────────────────────── */
const CarouselPreview = ({ banners }) => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[current];

  return (
    <div className="bl__carousel">
      {banner?.image ? (
        <img src={banner.image} alt={banner.title} className="bl__carousel-img" />
      ) : (
        <div className="bl__carousel-placeholder">No image</div>
      )}
      {banners.length > 1 && (
        <div className="bl__carousel-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`bl__carousel-dot${i === current ? " bl__carousel-dot--active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerList;