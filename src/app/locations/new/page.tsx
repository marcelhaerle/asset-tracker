'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLocationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    building: '',
    floor: '',
    room: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Location name is required');
      }

      // Submit data to the API
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create location');
      }

      await response.json();

      // Show success message
      setSuccessMessage('Location created successfully!');

      // Reset form data
      setFormData({
        name: '',
        description: '',
        building: '',
        floor: '',
        room: '',
        address: '',
      });

      // Redirect to locations page after a short delay
      setTimeout(() => {
        router.push('/locations');
        router.refresh(); // Refresh the page data
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while creating the location';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/locations');
  };

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column is-half is-offset-one-quarter">
            <h1 className="title is-2">Add New Location</h1>
            <h2 className="subtitle">Create a new location for asset tracking</h2>

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
                <div className="field">
                  <label className="label">Location Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Headquarters, Branch Office, Warehouse"
                      required
                    />
                  </div>
                  <p className="help">Name of the location (required)</p>
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of this location"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Building</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      placeholder="e.g. Main Building, Annex"
                    />
                  </div>
                </div>

                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label">Floor</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          name="floor"
                          value={formData.floor}
                          onChange={handleChange}
                          placeholder="e.g. 1st Floor, Basement"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="field">
                      <label className="label">Room</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          name="room"
                          value={formData.room}
                          onChange={handleChange}
                          placeholder="e.g. Room 101, Server Room"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Address</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full address of the location"
                    />
                  </div>
                </div>

                <div className="field is-grouped mt-5">
                  <div className="control">
                    <button
                      type="submit"
                      className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      Create Location
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
          </div>
        </div>
      </section>
    </div>
  );
}
