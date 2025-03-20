'use client';

import { useState } from 'react';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import Toast from '@/components/Toast';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
};

type EmployeeCheckoutButtonProps = {
  employee: Employee;
  onCheckoutUpdated?: () => void;
};

export default function EmployeeCheckoutButton({ 
  employee,
  onCheckoutUpdated
}: EmployeeCheckoutButtonProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

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
      
      // Notify parent component to refresh employee data
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

  return (
    <>
      <button
        className="button is-primary"
        onClick={() => setShowCheckoutModal(true)}
      >
        <span className="icon">
          <i className="fas fa-sign-out-alt"></i>
        </span>
        <span>Check Out Asset</span>
      </button>
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onCheckout={handleCheckout}
        employee={employee}
        checkoutType="employee"
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