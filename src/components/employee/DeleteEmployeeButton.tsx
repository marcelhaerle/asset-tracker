'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteEmployeeButtonProps = {
  employeeId: string;
  firstName: string;
  lastName: string;
  employeeIdNumber: string;
  onDeleteSuccess?: () => void;
};

export default function DeleteEmployeeButton({
  employeeId,
  firstName,
  lastName,
  employeeIdNumber,
  onDeleteSuccess,
}: DeleteEmployeeButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssociatedRecords, setHasAssociatedRecords] = useState(false);
  const [assetCount, setAssetCount] = useState(0);
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
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if error is due to associated records
        if (
          response.status === 400 &&
          (result.assetCount !== undefined || result.checkoutCount !== undefined)
        ) {
          setHasAssociatedRecords(true);
          if (result.assetCount) setAssetCount(result.assetCount);
          if (result.checkoutCount) setCheckoutCount(result.checkoutCount);
          throw new Error(result.error || 'Cannot delete employee with associated records');
        }
        throw new Error(result.error || 'Failed to delete employee');
      }

      // Close modal
      setIsModalOpen(false);

      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        // Otherwise, redirect to employees page
        router.push('/employees');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the employee');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="button is-danger"
        aria-label={`Delete employee ${firstName} ${lastName}`}
      >
        <span className="icon">
          <i className="fas fa-trash-alt"></i>
        </span>
        <span>Delete Employee</span>
      </button>

      <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={closeModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Confirm Deletion</p>
            <button className="delete" aria-label="close" onClick={closeModal}></button>
          </header>
          <section className="modal-card-body">
            {!hasAssociatedRecords ? (
              <div>
                <p>Are you sure you want to delete the following employee?</p>
                <div className="box mt-3">
                  <p>
                    <strong>Name:</strong> {firstName} {lastName}
                  </p>
                  <p>
                    <strong>Employee ID:</strong> {employeeIdNumber}
                  </p>
                </div>
                <p className="has-text-danger mt-3">This action cannot be undone.</p>

                {error && <div className="notification is-danger mt-4">{error}</div>}
              </div>
            ) : (
              <div>
                <div className="notification is-warning">
                  <p className="has-text-weight-bold">Cannot Delete Employee</p>
                  <p>This employee has associated records that must be removed first:</p>
                  <ul className="mt-2">
                    {assetCount > 0 && <li>• {assetCount} assigned asset(s)</li>}
                    {checkoutCount > 0 && <li>• {checkoutCount} checkout record(s)</li>}
                  </ul>
                </div>
                <p>Please remove these associated records before deleting this employee.</p>
              </div>
            )}
          </section>
          <footer className="modal-card-foot">
            {!hasAssociatedRecords ? (
              <div className="buttons">
                <button
                  className={`button is-danger ${isDeleting ? 'is-loading' : ''}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete Employee
                </button>
                <button className="button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="button" onClick={closeModal}>
                Close
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}
