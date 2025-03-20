'use client';

import { useState } from 'react';
import Link from 'next/link';
import CheckinModal from '@/components/checkout/CheckinModal';
import Toast from '@/components/Toast';

type CheckoutHistory = {
  id: string;
  checkedOutAt: string;
  returnedAt: string | null;
  notes: string | null;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    category: {
      id: string;
      name: string;
    };
  };
};

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

type EmployeeCheckoutHistoryProps = {
  checkoutHistory: CheckoutHistory[];
  onCheckoutUpdated?: () => void;
};

export default function EmployeeCheckoutHistory({
  checkoutHistory,
  onCheckoutUpdated,
}: EmployeeCheckoutHistoryProps) {
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutRecord | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle checkin
  const handleCheckin = async (data: { checkoutId: string; notes: string }) => {
    try {
      const response = await fetch(`/api/checkouts/${data.checkoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check-in',
          notes: data.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check in asset');
      }

      // Show success toast
      setToastMessage('Asset checked in successfully!');
      setToastType('success');
      setShowToast(true);

      // Notify parent component to refresh employee data
      if (onCheckoutUpdated) {
        onCheckoutUpdated();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in asset';
      // Show error toast
      setToastMessage(errorMessage);
      setToastType('danger');
      setShowToast(true);

      throw err;
    }
  };

  const openCheckinModal = (checkout: CheckoutHistory) => {
    // Format checkout record for the check-in modal
    setSelectedCheckout({
      id: checkout.id,
      checkedOutAt: checkout.checkedOutAt,
      asset: {
        id: checkout.asset.id,
        name: checkout.asset.name,
        assetTag: checkout.asset.assetTag,
        category: {
          name: checkout.asset.category.name,
        },
      },
      employee: {
        id: '', // The employee ID will be filled by the calling component
        firstName: '',
        lastName: '',
        employeeId: '',
      },
    });
    setShowCheckinModal(true);
  };

  return (
    <>
      <div className="box">
        <h3 className="title is-4 mb-4">Checkout History</h3>

        {checkoutHistory.length === 0 ? (
          <div className="notification is-info is-light">
            No checkout history for this employee.
          </div>
        ) : (
          <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Checked Out</th>
                  <th>Returned</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkoutHistory.map(record => (
                  <tr key={record.id}>
                    <td>
                      <Link href={`/assets/${record.asset.id}`}>
                        {record.asset.name} ({record.asset.assetTag})
                      </Link>
                    </td>
                    <td>{record.asset.category.name}</td>
                    <td>{formatDate(record.checkedOutAt)}</td>
                    <td>{record.returnedAt ? formatDate(record.returnedAt) : 'Not returned'}</td>
                    <td>{record.notes || '-'}</td>
                    <td>
                      {!record.returnedAt ? (
                        <button
                          className="button is-small is-primary"
                          onClick={() => openCheckinModal(record)}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-sign-in-alt"></i>
                          </span>
                          <span>Check In</span>
                        </button>
                      ) : (
                        <span className="tag is-success">Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {selectedCheckout && (
        <CheckinModal
          isOpen={showCheckinModal}
          onClose={() => setShowCheckinModal(false)}
          onCheckin={handleCheckin}
          checkoutRecord={selectedCheckout}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </>
  );
}
