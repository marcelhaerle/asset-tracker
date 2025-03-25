'use client';

import { useRouter } from 'next/navigation';
import Toast from '../Toast';
import { FormEvent, useEffect, useState } from 'react';

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

interface NewAssetFormProps {
  suggestAssetTag: string;
}

export default function NewAssetForm({ suggestAssetTag }: NewAssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Data for select inputs
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    assetTag: suggestAssetTag,
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

  // Fetch categories, locations, and employees for form select boxes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using Promise.all to fetch all data in parallel
        const [categoriesRes, locationsRes, employeesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
          fetch('/api/employees'),
        ]);

        if (!categoriesRes.ok || !locationsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesRes.json();
        const locationsData = await locationsRes.json();
        let employeesData = { employees: [] };

        // If employees API exists and returns successfully
        if (employeesRes.ok) {
          employeesData = await employeesRes.json();
        }

        setCategories(categoriesData.categories || []);
        setLocations(locationsData.locations || []);
        setEmployees(employeesData.employees || []);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create asset');
      }

      // Show success message and toast
      setSuccessMessage('Asset created successfully!');
      setShowSuccessToast(true);

      // Reset form data
      setFormData({
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

      // Redirect to assets page after a short delay
      setTimeout(() => {
        router.push('/assets');
        router.refresh(); // Refresh the page data
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while creating the asset';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/assets');
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
            <p className="mt-4">Loading form data...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title is-2">Add New Asset</h1>
        <h2 className="subtitle">Create a new asset in the inventory</h2>

        {error && (
          <div className="notification is-danger">
            <button className="delete" onClick={() => setError(null)}></button>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="notification is-success">
            <button className="delete" onClick={() => setSuccessMessage(null)}></button>
            {successMessage}
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
                  <p className="help">Manufacturer&apos;s serial number</p>
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
                          <i className="fas fa-euro-sign"></i>
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
                  <span>Create Asset</span>
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

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message="Asset created successfully! Redirecting to assets page..."
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
}
