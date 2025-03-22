import { useState } from 'react';
import { RecordFormData } from './types';

interface ServiceRecordFormProps {
  onSubmit: (data: RecordFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ServiceRecordForm({
  onSubmit,
  onCancel,
  isLoading
}: ServiceRecordFormProps) {
  const [formData, setFormData] = useState<RecordFormData>({
    serviceDate: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    provider: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="box mb-5">
      <h5 className="title is-6">Add Service Record</h5>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Service Date</label>
          <div className="control">
            <input 
              className="input" 
              type="date" 
              value={formData.serviceDate}
              onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="field">
          <label className="label">Description</label>
          <div className="control">
            <input 
              className="input" 
              type="text" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the service performed"
              required
            />
          </div>
        </div>
        
        <div className="columns">
          <div className="column">
            <div className="field">
              <label className="label">Cost</label>
              <div className="control">
                <input 
                  className="input" 
                  type="number" 
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="column">
            <div className="field">
              <label className="label">Provider</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  placeholder="Who performed the service"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="field">
          <label className="label">Notes</label>
          <div className="control">
            <textarea 
              className="textarea" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional notes about this service"
            />
          </div>
        </div>
        
        <div className="field is-grouped">
          <div className="control">
            <button 
              type="submit" 
              className={`button is-primary ${isLoading ? 'is-loading' : ''}`}
              disabled={isLoading}
            >
              Save Record
            </button>
          </div>
          <div className="control">
            <button 
              type="button" 
              className="button is-light" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}