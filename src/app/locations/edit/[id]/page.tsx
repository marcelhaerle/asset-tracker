'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

type Location = {
  id: string;
  name: string;
  description: string | null;
  building: string | null;
  floor: string | null;
  room: string | null;
  address: string | null;
};

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState<Location>({
    id: '',
    name: '',
    description: '',
    building: '',
    floor: '',
    room: '',
    address: ''
  });

  // Fetch location data when the component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/locations/${locationId}`);
        
        if (response.status === 404) {
          setNotFound(true);
          setError('Location not found');
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        
        // Convert null values to empty strings for form inputs
        setFormData({
          id: data.location.id,
          name: data.location.name,
          description: data.location.description || '',
          building: data.location.building || '',
          floor: data.location.floor || '',
          room: data.location.room || '',
          address: data.location.address || '',
        });
        
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching location data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }
      
      const result = await response.json();
      
      // Show success message
      setSuccessMessage('Location updated successfully!');
      
      // Redirect to locations page after a short delay
      setTimeout(() => {
        router.push('/locations');
        router.refresh(); // Refresh the page data
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/locations');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container">
        <section className="section">
          <div className="columns">
            <div className="column is-half is-offset-one-quarter">
              <div className="box has-text-centered p-6">
                <p className="mb-4">
                  <span className="icon is-large">
                    <i className="fas fa-spinner fa-pulse fa-3x"></i>
                  </span>
                </p>
                <p>Loading location data...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
  
  // Show not found state
  if (notFound) {
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
                <p className="title is-4">Location Not Found</p>
                <p className="mb-5">The location you're trying to edit doesn't exist or has been removed.</p>
                <button onClick={() => router.push('/locations')} className="button is-primary">
                  Return to Locations
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
          <div className="column is-half is-offset-one-quarter">
            <h1 className="title is-2">Edit Location</h1>
            <h2 className="subtitle">Update location details</h2>
            
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
                      value={formData.description || ''}
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
                      value={formData.building || ''}
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
                          value={formData.floor || ''}
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
                          value={formData.room || ''}
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
                      value={formData.address || ''}
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
                      Save Changes
                    </button>
                  </div>
                  <div className="control">
                    <button 
                      type="button" 
                      className="button is-light"
                      onClick={handleCancel}
                    >
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