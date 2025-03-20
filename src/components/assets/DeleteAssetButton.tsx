'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteAssetButtonProps = {
  assetId: string;
  assetName: string;
  assetTag: string;
  onDeleteSuccess?: () => void;
};

export default function DeleteAssetButton({
  assetId,
  assetName,
  assetTag,
  onDeleteSuccess
}: DeleteAssetButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssociatedRecords, setHasAssociatedRecords] = useState(false);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [checkoutCount, setCheckoutCount] = useState(0);

  const openModal = () => {
    setIsModalOpen(true);
    setError(null);
    setHasAssociatedRecords(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if error is due to associated records
        if (response.status === 400 && result.maintenanceCount !== undefined) {
          setHasAssociatedRecords(true);
          setMaintenanceCount(result.maintenanceCount);
          setCheckoutCount(result.checkoutCount);
          throw new Error(result.error || 'Cannot delete asset with associated records');
        }
        throw new Error(result.error || 'Failed to delete asset');
      }

      // Close modal
      setIsModalOpen(false);
      
      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        // Otherwise, redirect to assets page
        router.push('/assets');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the asset');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={openModal}
        className="button is-danger"
        aria-label={`Delete asset ${assetName}`}
      >
        <span className="icon">
          <i className="fas fa-trash-alt"></i>
        </span>
        <span>Delete Asset</span>
      </button>

      <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={closeModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Confirm Deletion</p>
            <button 
              className="delete" 
              aria-label="close" 
              onClick={closeModal}
            ></button>
          </header>
          <section className="modal-card-body">
            {!hasAssociatedRecords ? (
              <div>
                <p>Are you sure you want to delete the following asset?</p>
                <div className="box mt-3">
                  <p><strong>Name:</strong> {assetName}</p>
                  <p><strong>Asset Tag:</strong> {assetTag}</p>
                </div>
                <p className="has-text-danger mt-3">This action cannot be undone.</p>
                
                {error && (
                  <div className="notification is-danger mt-4">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="notification is-warning">
                  <p className="has-text-weight-bold">Cannot Delete Asset</p>
                  <p>This asset has associated records that must be removed first:</p>
                  <ul className="mt-2">
                    {maintenanceCount > 0 && (
                      <li>• {maintenanceCount} maintenance record(s)</li>
                    )}
                    {checkoutCount > 0 && (
                      <li>• {checkoutCount} checkout record(s)</li>
                    )}
                  </ul>
                </div>
                <p>Please remove these associated records before deleting this asset.</p>
              </div>
            )}
          </section>
          <footer className="modal-card-foot">
            {!hasAssociatedRecords ? (
              <>
                <button 
                  className={`button is-danger ${isDeleting ? 'is-loading' : ''}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete Asset
                </button>
                <button className="button" onClick={closeModal}>Cancel</button>
              </>
            ) : (
              <button className="button" onClick={closeModal}>Close</button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}