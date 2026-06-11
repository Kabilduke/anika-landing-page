import React, { useState } from "react";
import "./Dangerzone.css";

const DangerZone = () => {
  const [confirmModal, setConfirmModal] = useState(null);

  const handleAction = (action) => {
    setConfirmModal(action);
  };

  const handleConfirm = () => {
    // handle confirmed action
    setConfirmModal(null);
  };

  return (
    <div className="dz">
      <div className="dz__header">
        <h1 className="dz__title">Settings</h1>
        <p className="dz__subtitle">Danger Zone</p>
      </div>

      {/* Export & Backup Section */}
      <div className="dz__section">
        <div className="dz__row">
          <span className="dz__row-label">Export All Orders</span>
          <button className="dz__csv-btn">Download CSV</button>
        </div>
        <div className="dz__row">
          <span className="dz__row-label">Export all customers</span>
          <button className="dz__csv-btn">Download CSV</button>
        </div>
        <div className="dz__row">
          <span className="dz__row-label">Export all products</span>
          <button className="dz__csv-btn">Download CSV</button>
        </div>
        <div className="dz__row dz__row--last">
          <span className="dz__row-label">Last full backup</span>
          <span className="dz__backup-date">12 May 2026 - 2:00 AM</span>
        </div>
      </div>

      {/* Irreversible Actions */}
      <div className="dz__danger-section">
        <p className="dz__danger-heading">Irreversible actions</p>

        <div className="dz__danger-grid">
          {/* Clear all orders */}
          <div className="dz__danger-card">
            <p className="dz__danger-card-title">Clear all orders</p>
            <p className="dz__danger-card-desc">
              Permanently delete all order records. Customer accounts and products are not affected.
            </p>
            <button
              className="dz__danger-btn"
              onClick={() => handleAction("clear_orders")}
            >
              Save Preferences
            </button>
          </div>

          {/* Reset store to default */}
          <div className="dz__danger-card">
            <p className="dz__danger-card-title">Reset store to default</p>
            <p className="dz__danger-card-desc">
              Removes all products, categories, banners, and orders. Admin account is preserved. This cannot be undone.
            </p>
            <button
              className="dz__danger-btn"
              onClick={() => handleAction("reset_store")}
            >
              Save Preferences
            </button>
          </div>

          {/* Delete store permanently */}
          <div className="dz__danger-card dz__danger-card--full">
            <p className="dz__danger-card-title">Delete store permanently</p>
            <p className="dz__danger-card-desc">
              Closes your Anika Jewels store completely. All data including products, orders, customers, and admin accounts will be permanently erased. This action cannot be reversed.
            </p>
            <button
              className="dz__danger-btn"
              onClick={() => handleAction("delete_store")}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="dz__modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="dz__modal" onClick={(e) => e.stopPropagation()}>
            <p className="dz__modal-title">Are you sure?</p>
            <p className="dz__modal-desc">This action is irreversible. Please confirm to proceed.</p>
            <div className="dz__modal-actions">
              <button className="dz__modal-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="dz__modal-confirm" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;