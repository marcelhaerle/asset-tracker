'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

type Asset = {
  id: string;
  name: string;
  assetTag: string;
  status: string;
  category: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  } | null;
  assignedToId: string | null;
};

type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
};

export default function AssignAssetPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  // Fetch employee and available assets
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using Promise.all to fetch both data sets in parallel
        const [employeeRes, assetsRes] = await Promise.all([
          fetch(`/api/employees/${employeeId}`),
          fetch('/api/assets'),
        ]);

        if (!employeeRes.ok) {
          if (employeeRes.status === 404) {
            throw new Error('Employee not found');
          }
          throw new Error('Failed to fetch employee data');
        }

        if (!assetsRes.ok) {
          throw new Error('Failed to fetch assets data');
        }

        const employeeData = await employeeRes.json();
        const assetsData = await assetsRes.json();

        // Set employee data
        setEmployee({
          id: employeeData.employee.id,
          employeeId: employeeData.employee.employeeId,
          firstName: employeeData.employee.firstName,
          lastName: employeeData.employee.lastName,
        });

        // Filter assets to only include available ones
        const availableAssets = assetsData.assets.filter(
          (asset: Asset) => asset.status === 'AVAILABLE' || asset.assignedToId === employeeId
        );

        setAssets(availableAssets);
        setFilteredAssets(availableAssets);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  // Filter assets based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAssets(assets);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = assets.filter(
      asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetTag.toLowerCase().includes(searchLower) ||
        asset.category.name.toLowerCase().includes(searchLower)
    );

    setFilteredAssets(filtered);
  }, [searchTerm, assets]);

  const handleAssign = async () => {
    if (!selectedAssetId) {
      setToastMessage('Please select an asset to assign');
      setToastType('danger');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current assignment status of the selected asset
      const asset = assets.find(a => a.id === selectedAssetId);

      // If the asset is already assigned to this employee, we'll unassign it
      const isUnassigning = asset?.assignedToId === employeeId;

      // Update the asset with the new assignment
      const response = await fetch(`/api/assets/${selectedAssetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: isUnassigning ? null : employeeId,
          // We need to include these required fields to avoid validation errors
          name: asset?.name,
          assetTag: asset?.assetTag,
          categoryId: asset?.category.id,
          status: isUnassigning ? 'AVAILABLE' : 'IN_USE',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update asset assignment');
      }

      // Show success toast
      setToastMessage(
        isUnassigning ? 'Asset unassigned successfully!' : 'Asset assigned successfully!'
      );
      setToastType('success');
      setShowToast(true);

      // Redirect back to employee page after a short delay
      setTimeout(() => {
        router.push(`/employees/${employeeId}`);
        router.refresh(); // Refresh the page data
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while updating assignment';
      setError(errorMessage);
      setToastMessage(errorMessage);
      setToastType('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <section className="section">
          <div className="has-text-centered py-6">
            <span className="icon is-large">
              <i className="fas fa-spinner fa-pulse fa-3x"></i>
            </span>
            <p className="mt-4">Loading data...</p>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error && !employee) {
    return (
      <div className="container">
        <section className="section">
          <div className="columns">
            <div className="column is-half is-offset-one-quarter">
              <div className="box has-text-centered p-6">
                <p className="mb-4">
                  <span className="icon is-large has-text-danger">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                  </span>
                </p>
                <p className="title is-4">Error Loading Data</p>
                <p className="mb-5">{error}</p>
                <button onClick={() => router.push('/employees')} className="button is-primary">
                  Return to Employees
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Assign Assets</h1>
            <h2 className="subtitle">
              Manage asset assignments for {employee?.firstName} {employee?.lastName}
            </h2>

            {error && (
              <div className="notification is-danger">
                <button className="delete" onClick={() => setError(null)}></button>
                {error}
              </div>
            )}

            <div className="box">
              <div className="level mb-5">
                <div className="level-left">
                  <div className="level-item">
                    <div className="field has-addons">
                      <div className="control has-icons-left is-expanded">
                        <input
                          className="input"
                          type="text"
                          placeholder="Search assets by name, tag, or category"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                        <span className="icon is-small is-left">
                          <i className="fas fa-search"></i>
                        </span>
                      </div>
                      {searchTerm && (
                        <div className="control">
                          <button className="button is-info" onClick={() => setSearchTerm('')}>
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <div className="buttons">
                      <button
                        className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                        disabled={!selectedAssetId || isSubmitting}
                        onClick={handleAssign}
                      >
                        <span className="icon">
                          <i className="fas fa-save"></i>
                        </span>
                        <span>Update Assignment</span>
                      </button>
                      <Link href={`/employees/${employeeId}`} className="button is-light">
                        <span className="icon">
                          <i className="fas fa-times"></i>
                        </span>
                        <span>Cancel</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="notification is-info is-light">
                  {searchTerm
                    ? 'No matching assets found. Try a different search term.'
                    : 'There are no available assets to assign.'}
                </div>
              ) : (
                <div className="table-container">
                  <table className="table is-fullwidth is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th style={{ width: '1%' }}>Select</th>
                        <th>Asset Tag</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map(asset => (
                        <tr key={asset.id}>
                          <td>
                            <div className="control">
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="selectedAsset"
                                  checked={selectedAssetId === asset.id}
                                  onChange={() => setSelectedAssetId(asset.id)}
                                />
                              </label>
                            </div>
                          </td>
                          <td>{asset.assetTag}</td>
                          <td>{asset.name}</td>
                          <td>{asset.category.name}</td>
                          <td>{asset.location ? asset.location.name : 'Not specified'}</td>
                          <td>
                            <span
                              className={`tag ${
                                asset.assignedToId === employeeId ? 'is-primary' : 'is-success'
                              }`}
                            >
                              {asset.assignedToId === employeeId
                                ? 'Assigned to this employee'
                                : 'Available'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
