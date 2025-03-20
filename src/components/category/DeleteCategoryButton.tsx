'use client';

import { useState } from 'react';

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  onDeleted,
}: {
  categoryId: string;
  categoryName: string;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      onDeleted();
      setShowConfirm(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button className="button is-danger" onClick={() => setShowConfirm(true)}>
        Delete
      </button>

      {showConfirm && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setShowConfirm(false)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Confirm Delete</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setShowConfirm(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <p>
                Are you sure you want to delete the category <strong>{categoryName}</strong>?
              </p>
              {error && <div className="notification is-danger mt-4">{error}</div>}
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  className={`button is-danger ${isDeleting ? 'is-loading' : ''}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete
                </button>
                <button
                  className="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
