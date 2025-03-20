'use client';

import { useState } from 'react';
import Link from 'next/link';
import CheckoutList from '@/components/checkout/CheckoutList';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import Toast from '@/components/Toast';

export default function CheckoutsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'returned'>('active');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutUpdated, setCheckoutUpdated] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

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
      
      // Trigger refresh of checkout list
      setCheckoutUpdated(prev => prev + 1);
    } catch (err: any) {
      // Show error toast
      setToastMessage(err.message || 'Failed to check out asset');
      setToastType('danger');
      setShowToast(true);
      
      throw err;
    }
  };

  // Handle checkout updated
  const handleCheckoutUpdated = () => {
    setCheckoutUpdated(prev => prev + 1);
    setToastMessage('Asset checked in successfully!');
    setToastType('success');
    setShowToast(true);
  };

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Asset Checkouts</h1>
            <h2 className="subtitle">Manage equipment checkouts and returns</h2>
          </div>
          <div className="column is-narrow">
            <button 
              className="button is-primary"
              onClick={() => setShowCheckoutModal(true)}
            >
              <span className="icon">
                <i className="fas fa-sign-out-alt"></i>
              </span>
              <span>New Checkout</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="tabs">
          <ul>
            <li className={activeTab === 'active' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('active')}>Active Checkouts</a>
            </li>
            <li className={activeTab === 'returned' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('returned')}>Returned Assets</a>
            </li>
            <li className={activeTab === 'all' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('all')}>All Records</a>
            </li>
          </ul>
        </div>

        {/* Tab content */}
        <div className="box">
          <CheckoutList 
            checkoutType={activeTab}
            title={
              activeTab === 'active' ? 'Active Checkouts' : 
              activeTab === 'returned' ? 'Returned Assets' : 
              'All Checkout Records'
            }
            key={`checkout-list-${activeTab}-${checkoutUpdated}`}
            onCheckoutUpdated={handleCheckoutUpdated}
          />
        </div>
      </section>
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onCheckout={handleCheckout}
        checkoutType="asset"
      />
      
      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}