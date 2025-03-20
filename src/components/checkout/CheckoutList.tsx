'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CheckinModal from './CheckinModal';

type CheckoutRecord = {
  id: string;
  checkedOutAt: string;
  returnedAt: string | null;
  notes: string | null;
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

type CheckoutListProps = {
  checkoutType?: 'all' | 'active' | 'returned';
  title?: string;
  employeeId?: string;
  assetId?: string;
  limit?: number;
  onCheckoutUpdated?: () => void;
};

export default function CheckoutList({
  checkoutType = 'all',
  title = 'Checkout History',
  employeeId,
  assetId,
  limit,
  onCheckoutUpdated,
}: CheckoutListProps) {
  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCheckouts, setFilteredCheckouts] = useState<CheckoutRecord[]>([]);

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutRecord | null>(null);

  // Fetch checkouts
  useEffect(() => {
    const fetchCheckouts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Basic endpoint
        let endpoint = '/api/checkouts';

        // Add query parameters if needed
        const params = new URLSearchParams();
        if (employeeId) params.append('employeeId', employeeId);
        if (assetId) params.append('assetId', assetId);
        if (limit) params.append('limit', limit.toString());

        const queryString = params.toString();
        if (queryString) endpoint += `?${queryString}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Failed to fetch checkout records');
        }

        const data = await response.json();
        setCheckouts(data.checkoutRecords);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching checkout records';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckouts();
  }, [employeeId, assetId, limit]);

  // Filter checkouts based on type
  useEffect(() => {
    if (checkoutType === 'all') {
      setFilteredCheckouts(checkouts);
    } else if (checkoutType === 'active') {
      setFilteredCheckouts(checkouts.filter(checkout => !checkout.returnedAt));
    } else if (checkoutType === 'returned') {
      setFilteredCheckouts(checkouts.filter(checkout => checkout.returnedAt));
    }
  }, [checkouts, checkoutType]);

  // Handle check-in
  const handleCheckIn = async (data: { checkoutId: string; notes: string }) => {
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

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to check in asset');
      }

      // Refresh the list
      if (onCheckoutUpdated) {
        onCheckoutUpdated();
      } else {
        // If no callback provided, refresh the data directly
        const updatedResponse = await fetch('/api/checkouts');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setCheckouts(updatedData.checkoutRecords);
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while checking in the asset';
      throw new Error(errorMessage);
    }
  };

  const openCheckinModal = (checkout: CheckoutRecord) => {
    setSelectedCheckout(checkout);
    setShowCheckinModal(true);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not returned';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="has-text-centered py-4">
        <span className="icon is-large">
          <i className="fas fa-spinner fa-pulse fa-2x"></i>
        </span>
        <p className="mt-2">Loading checkout records...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="notification is-danger">
        <p className="has-text-weight-bold">Error loading checkout records</p>
        <p>{error}</p>
      </div>
    );
  }

  // Show empty state
  if (filteredCheckouts.length === 0) {
    return (
      <div className="notification is-info is-light">
        <p className="has-text-weight-bold">No checkout records found</p>
        <p>There are no checkout records matching the current criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="title is-4 mb-4">{title}</h3>

      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Employee</th>
              <th>Checked Out</th>
              <th>Returned</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheckouts.map(checkout => (
              <tr key={checkout.id}>
                <td>
                  <Link href={`/assets/${checkout.asset.id}`}>
                    {checkout.asset.name} ({checkout.asset.assetTag})
                  </Link>
                </td>
                <td>
                  <Link href={`/employees/${checkout.employee.id}`}>
                    {checkout.employee.firstName} {checkout.employee.lastName}
                  </Link>
                </td>
                <td>{formatDate(checkout.checkedOutAt)}</td>
                <td>
                  {checkout.returnedAt ? (
                    formatDate(checkout.returnedAt)
                  ) : (
                    <span className="tag is-warning">Not returned</span>
                  )}
                </td>
                <td>{checkout.notes || '-'}</td>
                <td>
                  {!checkout.returnedAt ? (
                    <button
                      className="button is-small is-primary"
                      onClick={() => openCheckinModal(checkout)}
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

      {/* Check-in Modal */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        onCheckin={handleCheckIn}
        checkoutRecord={selectedCheckout}
      />
    </div>
  );
}
