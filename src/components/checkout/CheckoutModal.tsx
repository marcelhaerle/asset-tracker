'use client';

import { useState, useEffect } from 'react';

type Asset = {
  id: string;
  name: string;
  assetTag: string;
  category: {
    name: string;
  };
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
};

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (data: CheckoutFormData) => Promise<void>;
  asset?: Asset | null;
  employee?: Employee | null;
  checkoutType: 'asset' | 'employee';
};

type CheckoutFormData = {
  assetId: string;
  employeeId: string;
  notes: string;
};

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  onCheckout, 
  asset = null, 
  employee = null,
  checkoutType
}: CheckoutModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    assetId: asset?.id || '',
    employeeId: employee?.id || '',
    notes: ''
  });

  // Fetch assets and employees
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we already have an asset, we don't need to fetch assets
        const assetPromise = asset ? Promise.resolve(null) : fetch('/api/assets?status=AVAILABLE');
        
        // If we already have an employee, we don't need to fetch employees
        const employeePromise = employee ? Promise.resolve(null) : fetch('/api/employees');
        
        const [assetRes, employeeRes] = await Promise.all([assetPromise, employeePromise]);
        
        // Process assets data if we needed to fetch it
        if (!asset && assetRes) {
          if (!assetRes.ok) {
            throw new Error('Failed to fetch available assets');
          }
          const assetData = await assetRes.json();
          // Only include available assets
          setAssets(assetData.assets.filter((a: any) => a.status === 'AVAILABLE'));
        }
        
        // Process employees data if we needed to fetch it
        if (!employee && employeeRes) {
          if (!employeeRes.ok) {
            throw new Error('Failed to fetch employees');
          }
          const employeeData = await employeeRes.json();
          setEmployees(employeeData.employees);
        }
        
        // If we have a pre-selected asset, set it in form data
        if (asset) {
          setFormData(prev => ({ ...prev, assetId: asset.id }));
        }
        
        // If we have a pre-selected employee, set it in form data
        if (employee) {
          setFormData(prev => ({ ...prev, employeeId: employee.id }));
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, asset, employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onCheckout(formData);
      
      // Clear form data on successful submission
      setFormData({
        assetId: asset?.id || '',
        employeeId: employee?.id || '',
        notes: ''
      });
      
      // Close the modal
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {checkoutType === 'asset' 
              ? 'Check Out Asset'
              : 'Check Out Asset to Employee'}
          </p>
          <button 
            className="delete" 
            aria-label="close" 
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          {error && (
            <div className="notification is-danger">
              <button className="delete" onClick={() => setError(null)}></button>
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="has-text-centered p-4">
              <span className="icon is-large">
                <i className="fas fa-spinner fa-pulse fa-2x"></i>
              </span>
              <p className="mt-2">Loading data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Asset selection - only show if no asset is pre-selected */}
              {!asset && (
                <div className="field">
                  <label className="label">Asset *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="assetId"
                        value={formData.assetId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select an asset</option>
                        {assets.map(asset => (
                          <option key={asset.id} value={asset.id}>
                            {asset.assetTag} - {asset.name} ({asset.category.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {assets.length === 0 && (
                    <p className="help is-warning">No available assets found.</p>
                  )}
                </div>
              )}
              
              {/* Display selected asset info if an asset is pre-selected */}
              {asset && (
                <div className="field">
                  <label className="label">Asset</label>
                  <div className="box p-3">
                    <p className="is-size-5">{asset.name}</p>
                    <p className="is-size-6 has-text-grey">{asset.assetTag} | {asset.category.name}</p>
                  </div>
                </div>
              )}
              
              {/* Employee selection - only show if no employee is pre-selected */}
              {!employee && (
                <div className="field mt-4">
                  <label className="label">Employee *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select an employee</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {employees.length === 0 && (
                    <p className="help is-warning">No employees found.</p>
                  )}
                </div>
              )}
              
              {/* Display selected employee info if an employee is pre-selected */}
              {employee && (
                <div className="field mt-3">
                  <label className="label">Employee</label>
                  <div className="box p-3">
                    <p className="is-size-5">{employee.firstName} {employee.lastName}</p>
                    <p className="is-size-6 has-text-grey">Employee ID: {employee.employeeId}</p>
                  </div>
                </div>
              )}
              
              {/* Notes for checkout */}
              <div className="field mt-4">
                <label className="label">Notes</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add notes about this checkout (optional)"
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
            disabled={isLoading || isSubmitting || !formData.assetId || !formData.employeeId}
          >
            <span className="icon">
              <i className="fas fa-sign-out-alt"></i>
            </span>
            <span>Check Out</span>
          </button>
          <button className="button" onClick={onClose}>Cancel</button>
        </footer>
      </div>
    </div>
  );
}