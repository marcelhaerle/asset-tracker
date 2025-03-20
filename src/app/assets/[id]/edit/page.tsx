'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Toast from '@/components/Toast';

type Category = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
};

type AssetWithRelations = {
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
  categoryId: string;
  locationId: string | null;
  assignedToId: string | null;
  category: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  } | null;
};

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  // Data for select inputs
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    serialNumber: '',
    description: '',
    model: '',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: '',
    expectedLifespan: '',
    status: 'AVAILABLE',
    notes: '',
    categoryId: '',
    locationId: '',
    assignedToId: '',
  });

  // Fetch asset data and form options
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using Promise.all to fetch all data in parallel
        const [assetRes, categoriesRes, locationsRes, employeesRes] = await Promise.all([
          fetch(`/api/assets/${assetId}`),
          fetch('/api/categories'),
          fetch('/api/locations'),
          fetch('/api/employees'),
        ]);

        if (!assetRes.ok) {
          if (assetRes.status === 404) {
            throw new Error('Asset not found');
          }
          throw new Error('Failed to fetch asset data');
        }

        if (!categoriesRes.ok || !locationsRes.ok) {
          throw new Error('Failed to fetch form data');
        }

        const assetData = await assetRes.json();
        const categoriesData = await categoriesRes.json();
        const locationsData = await locationsRes.json();
        let employeesData = { employees: [] };

        // If employees API exists and returns successfully
        if (employeesRes.ok) {
          employeesData = await employeesRes.json();
        }

        const asset = assetData.asset;

        // Format the date for input field (YYYY-MM-DD)
        const formattedPurchaseDate = asset.purchaseDate
          ? new Date(asset.purchaseDate).toISOString().split('T')[0]
          : '';

        // Update form data with asset values
        setFormData({
          name: asset.name,
          assetTag: asset.assetTag,
          serialNumber: asset.serialNumber || '',
          description: asset.description || '',
          model: asset.model || '',
          manufacturer: asset.manufacturer || '',
          purchaseDate: formattedPurchaseDate,
          purchasePrice: asset.purchasePrice ? asset.purchasePrice.toString() : '',
          expectedLifespan: asset.expectedLifespan ? asset.expectedLifespan.toString() : '',
          status: asset.status,
          notes: asset.notes || '',
          categoryId: asset.categoryId,
          locationId: asset.locationId || '',
          assignedToId: asset.assignedToId || '',
        });

        setCategories(categoriesData.categories || []);
        setLocations(locationsData.locations || []);
        setEmployees(employeesData.employees || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assetId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.name.trim() || !formData.assetTag.trim() || !formData.categoryId) {
        throw new Error('Name, asset tag, and category are required');
      }

      // Submit data to the API
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update asset');
      }

      // Show success message and toast
      setToastMessage('Asset updated successfully!');
      setToastType('success');
      setShowToast(true);

      // Redirect to asset details page after a short delay
      setTimeout(() => {
        router.push(`/assets/${assetId}`);
        router.refresh(); // Refresh the page data
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the asset');
      setToastMessage(err.message || 'An error occurred while updating the asset');
      setToastType('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/assets/${assetId}`);
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
            <p className="mt-4">Loading asset data...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title is-2">Edit Asset</h1>
        <h2 className="subtitle">Update asset information</h2>

        {error && (
          <div className="notification is-danger">
            <button className="delete" onClick={() => setError(null)}></button>
            {error}
          </div>
        )}

        <div className="box">
          <form onSubmit={handleSubmit}>
            <div className="columns">
              <div className="column">
                {/* Basic Information */}
                <h3 className="title is-4">Basic Information</h3>

                <div className="field">
                  <label className="label">Asset Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dell XPS 15 Laptop"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Asset Tag / ID *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="assetTag"
                      value={formData.assetTag}
                      onChange={handleChange}
                      placeholder="e.g. LAP-0001"
                      required
                    />
                  </div>
                  <p className="help">Unique identifier for this asset</p>
                </div>

                <div className="field">
                  <label className="label">Serial Number</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      placeholder="e.g. SN12345678"
                    />
                  </div>
                  <p className="help">Manufacturer's serial number</p>
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of this asset"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Category *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column">
                {/* Asset Details */}
                <h3 className="title is-4">Asset Details</h3>

                <div className="field">
                  <label className="label">Manufacturer</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="e.g. Dell, Cisco, HP"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Model</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g. XPS 15 9570"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Purchase Date</label>
                  <div className="control">
                    <input
                      className="input"
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label">Purchase Price</label>
                      <div className="control has-icons-left">
                        <input
                          className="input"
                          type="number"
                          step="0.01"
                          min="0"
                          name="purchasePrice"
                          value={formData.purchasePrice}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                        <span className="icon is-small is-left">
                          <i className="fas fa-dollar-sign"></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="field">
                      <label className="label">Expected Lifespan (months)</label>
                      <div className="control">
                        <input
                          className="input"
                          type="number"
                          min="0"
                          name="expectedLifespan"
                          value={formData.expectedLifespan}
                          onChange={handleChange}
                          placeholder="e.g. 36"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Status</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="IN_REPAIR">In Repair</option>
                        <option value="RETIRED">Retired</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="columns">
              <div className="column">
                {/* Location and Assignment */}
                <h3 className="title is-4">Location & Assignment</h3>

                <div className="field">
                  <label className="label">Location</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select name="locationId" value={formData.locationId} onChange={handleChange}>
                        <option value="">None</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Assigned To</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="assignedToId"
                        value={formData.assignedToId}
                        onChange={handleChange}
                      >
                        <option value="">None</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Notes</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Additional notes about this asset"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-grouped mt-5">
              <div className="control">
                <button
                  type="submit"
                  className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                  disabled={isSubmitting}
                >
                  <span className="icon">
                    <i className="fas fa-save"></i>
                  </span>
                  <span>Update Asset</span>
                </button>
              </div>
              <div className="control">
                <button type="button" className="button is-light" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
