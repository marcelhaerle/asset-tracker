'use client';

import { useState } from 'react';

type CheckoutRecord = {
  id: string;
  checkedOutAt: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    category: {
      name: string;
    };
  };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
};

type CheckinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckin: (data: CheckinFormData) => Promise<void>;
  checkoutRecord: CheckoutRecord | null;
};

type CheckinFormData = {
  checkoutId: string;
  notes: string;
};

export default function CheckinModal({
  isOpen,
  onClose,
  onCheckin,
  checkoutRecord,
}: CheckinModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckinFormData>({
    checkoutId: checkoutRecord?.id || '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkoutRecord) {
      setError('No checkout record provided');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCheckin({
        ...formData,
        checkoutId: checkoutRecord.id,
      });

      // Clear form data on successful submission
      setFormData({
        checkoutId: '',
        notes: '',
      });

      // Close the modal
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during check in';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Check In Asset</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          {error && (
            <div className="notification is-danger">
              <button className="delete" onClick={() => setError(null)}></button>
              {error}
            </div>
          )}

          {!checkoutRecord ? (
            <div className="notification is-warning">No checkout record selected.</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Asset details */}
              <div className="field">
                <label className="label">Asset</label>
                <div className="box p-3">
                  <p className="is-size-5">{checkoutRecord.asset.name}</p>
                  <p className="is-size-6 has-text-grey">
                    {checkoutRecord.asset.assetTag} | {checkoutRecord.asset.category.name}
                  </p>
                </div>
              </div>

              {/* Employee details */}
              <div className="field mt-3">
                <label className="label">Checked Out To</label>
                <div className="box p-3">
                  <p className="is-size-5">
                    {checkoutRecord.employee.firstName} {checkoutRecord.employee.lastName}
                  </p>
                  <p className="is-size-6 has-text-grey">
                    Employee ID: {checkoutRecord.employee.employeeId}
                  </p>
                </div>
              </div>

              {/* Checkout date */}
              <div className="field mt-3">
                <label className="label">Checked Out On</label>
                <p>{formatDate(checkoutRecord.checkedOutAt)}</p>
              </div>

              {/* Return notes */}
              <div className="field mt-4">
                <label className="label">Return Notes</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add notes about this return (condition, issues, etc.)"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </form>
          )}
        </section>
        <footer className="modal-card-foot">
          <button
            className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting || !checkoutRecord}
          >
            <span className="icon">
              <i className="fas fa-sign-in-alt"></i>
            </span>
            <span>Check In</span>
          </button>
          <button className="button" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
