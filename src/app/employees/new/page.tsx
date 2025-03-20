'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Toast from '@/components/Toast';

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.employeeId.trim() ||
        !formData.email.trim()
      ) {
        throw new Error('First name, last name, employee ID, and email are required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Submit data to the API
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create employee');
      }

      // Show success toast
      setToastMessage('Employee created successfully!');
      setToastType('success');
      setShowToast(true);

      // Redirect to employees page after a short delay
      setTimeout(() => {
        router.push('/employees');
        router.refresh(); // Refresh the page data
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while creating the employee';
      setError(errorMessage);
      setToastMessage(errorMessage);
      setToastType('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <section className="section">
        <h1 className="title is-2">Add New Employee</h1>
        <h2 className="subtitle">Create a new employee record</h2>

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
                <h3 className="title is-4">Employee Information</h3>

                <div className="field">
                  <label className="label">First Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. John"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Last Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Employee ID *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="e.g. EMP-0001"
                      required
                    />
                  </div>
                  <p className="help">Unique identifier for this employee</p>
                </div>

                <div className="field">
                  <label className="label">Email *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john.doe@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="column">
                {/* Additional Information */}
                <h3 className="title is-4">Additional Information</h3>

                <div className="field">
                  <label className="label">Department</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. IT, HR, Finance"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Position</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer, HR Manager"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Phone Number</label>
                  <div className="control">
                    <input
                      className="input"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. (123) 456-7890"
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />{' '}
                      Active Employee
                    </label>
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
                  <span>Create Employee</span>
                </button>
              </div>
              <div className="control">
                <Link href="/employees" className="button is-light">
                  Cancel
                </Link>
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
