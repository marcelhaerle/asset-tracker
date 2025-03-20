'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

type LocationWithAssets = {
  id: string;
  name: string;
  assets: any[];
};

export default function DeleteLocationButton({ location }: { location: LocationWithAssets }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetCount, setAssetCount] = useState(location.assets.length);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Check if the error is due to associated assets
        if (response.status === 400 && data.assetCount) {
          setAssetCount(data.assetCount);
          throw new Error(data.error || 'This location has associated assets and cannot be deleted.');
        }
        
        throw new Error(data.error || 'Failed to delete location');
      }
      
      // Close modal, show success toast, and refresh page
      setIsModalOpen(false);
      setShowSuccessToast(true);
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={openModal} 
        className="button is-danger is-small"
        aria-label={`Delete ${location.name}`}
      >
        <span className="icon is-small">
          <i className="fas fa-trash"></i>
        </span>
        <span>Delete</span>
      </button>
      
      {/* Delete confirmation modal */}
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
            {error ? (
              <div className="notification is-danger">
                <p>{error}</p>
                {assetCount > 0 && (
                  <div className="mt-4">
                    <p>This location has {assetCount} associated assets. You must reassign or remove these assets before deleting the location.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p>Are you sure you want to delete the location: <strong>{location.name}</strong>?</p>
                <p className="mt-4">This action cannot be undone.</p>
                
                {assetCount > 0 && (
                  <div className="notification is-warning mt-4">
                    <p>
                      <span className="icon">
                        <i className="fas fa-exclamation-triangle"></i>
                      </span>
                      <span>This location has {assetCount} associated assets. You must reassign or remove these assets before deleting.</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
          <footer className="modal-card-foot">
            <button 
              className={`button is-danger ${isDeleting ? 'is-loading' : ''}`}
              onClick={handleDelete}
              disabled={isDeleting || assetCount > 0}
            >
              Delete Location
            </button>
            <button 
              className="button" 
              onClick={closeModal}
            >
              Cancel
            </button>
          </footer>
        </div>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <Toast 
          message={`Location "${location.name}" has been deleted successfully.`}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
}