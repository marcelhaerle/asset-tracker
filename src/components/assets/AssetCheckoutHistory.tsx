'use client';

import { useState } from 'react';
import Link from 'next/link';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import CheckinModal from '@/components/checkout/CheckinModal';
import Toast from '@/components/Toast';

type AssetWithCheckoutHistory = {
  id: string;
  assetTag: string;
  name: string;
  serialNumber: string | null;
  description: string | null;
  model: string | null;
  manufacturer: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  expectedLifespan: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  checkoutHistory: {
    id: string;
    checkedOutAt: string;
    returnedAt: string | null;
    notes: string | null;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeId: string;
    };
  }[];
};

type AssetCheckoutHistoryProps = {
  asset: AssetWithCheckoutHistory;
  onCheckoutUpdated?: () => void;
};

export default function AssetCheckoutHistory({ 
  asset, 
  onCheckoutUpdated 
}: AssetCheckoutHistoryProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [activeCheckout, setActiveCheckout] = useState<any>(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Find active checkout record (if any)
  const getActiveCheckout = () => {
    const activeCheckout = asset.checkoutHistory.find(record => !record.returnedAt);
    
    if (!activeCheckout) return null;
    
    return {
      id: activeCheckout.id,
      checkedOutAt: activeCheckout.checkedOutAt,
      asset: {
        id: asset.id,
        name: asset.name,
        assetTag: asset.assetTag,
        category: {
          name: asset.category.name
        }
      },
      employee: activeCheckout.employee
    };
  };
  
  // Handle checkout
  const handleCheckout = async (data: { assetId: string; employeeId: string; notes: string }) => {
    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check out asset');
      }
      
      // Show success toast
      setToastMessage('Asset checked out successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Notify parent component to refresh asset data
      if (onCheckoutUpdated) {
        onCheckoutUpdated();
      }
    } catch (err: any) {
      // Show error toast
      setToastMessage(err.message || 'Failed to check out asset');
      setToastType('danger');
      setShowToast(true);
      
      throw err;
    }
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
          notes: data.notes
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
      
      // Notify parent component to refresh asset data
      if (onCheckoutUpdated) {
        onCheckoutUpdated();
      }
    } catch (err: any) {
      // Show error toast
      setToastMessage(err.message || 'Failed to check in asset');
      setToastType('danger');
      setShowToast(true);
      
      throw err;
    }
  };
  
  const handleCheckoutClick = () => {
    // Check if asset is already checked out
    const currentCheckout = getActiveCheckout();
    
    if (currentCheckout) {
      // If checked out, show check-in modal
      setActiveCheckout(currentCheckout);
      setShowCheckinModal(true);
    } else {
      // If available, show check-out modal
      setShowCheckoutModal(true);
    }
  };

  return (
    <>
      <div className="box">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h3 className="title is-4">Checkout History</h3>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button 
                className="button is-small is-primary"
                onClick={handleCheckoutClick}
              >
                <span className="icon is-small">
                  <i className="fas fa-exchange-alt"></i>
                </span>
                <span>
                  {getActiveCheckout() ? 'Check In' : 'Check Out'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {asset.checkoutHistory.length === 0 ? (
          <div className="notification is-info is-light">No checkout history for this asset.</div>
        ) : (
          <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>Checked Out</th>
                  <th>Returned</th>
                  <th>Employee</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {asset.checkoutHistory.map(record => (
                  <tr key={record.id}>
                    <td>{formatDate(record.checkedOutAt)}</td>
                    <td>{record.returnedAt ? formatDate(record.returnedAt) : 'Not returned'}</td>
                    <td>
                      <Link href={`/employees/${record.employee.id}`}>
                        {`${record.employee.firstName} ${record.employee.lastName}`}
                      </Link>
                      <div className="is-size-7 has-text-grey">
                        {record.employee.employeeId}
                      </div>
                    </td>
                    <td>{record.notes || '-'}</td>
                    <td>
                      {record.returnedAt ? (
                        <span className="tag is-success">Returned</span>
                      ) : (
                        <span className="tag is-warning">Checked Out</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Check-out Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onCheckout={handleCheckout}
        asset={{
          id: asset.id,
          name: asset.name,
          assetTag: asset.assetTag,
          category: {
            name: asset.category.name
          }
        }}
        checkoutType="asset"
      />
      
      {/* Check-in Modal */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        onCheckin={handleCheckin}
        checkoutRecord={activeCheckout}
      />
      
      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}