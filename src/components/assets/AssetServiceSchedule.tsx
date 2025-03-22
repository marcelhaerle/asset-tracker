import { useState } from 'react';

type ServiceRecord = {
  id: string;
  serviceDate: string;
  description: string;
  cost: number | null;
  provider: string | null;
  notes: string | null;
};

type ServiceSchedule = {
  id: string;
  enabled: boolean;
  intervalMonths: number;
  lastServiceDate: string | null;
  nextServiceDate: string;
  notes: string | null;
  serviceRecords: ServiceRecord[];
};

type AssetWithServiceSchedule = {
  id: string;
  name: string;
  assetTag: string;
  serviceSchedule: ServiceSchedule | null;
};

export default function AssetServiceSchedule({ 
  asset,
  onScheduleUpdated
}: { 
  asset: AssetWithServiceSchedule;
  onScheduleUpdated: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for service schedule
  const [scheduleForm, setScheduleForm] = useState({
    intervalMonths: 3,
    nextServiceDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Form state for service record
  const [recordForm, setRecordForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    provider: '',
    notes: ''
  });
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const intervalLabel = (months: number) => {
    switch (months) {
      case 3: return 'Quarterly (3 months)';
      case 6: return 'Bi-annually (6 months)';
      case 12: return 'Annually (12 months)';
      default: return `Every ${months} months`;
    }
  };
  
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/service-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: asset.id,
          intervalMonths: parseInt(scheduleForm.intervalMonths.toString()),
          nextServiceDate: scheduleForm.nextServiceDate,
          notes: scheduleForm.notes || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create service schedule');
      }
      
      // Reset form
      setScheduleForm({
        intervalMonths: 3,
        nextServiceDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Update the UI
      setIsCreating(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error creating service schedule:', error);
      alert('Failed to create service schedule');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/service-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceScheduleId: asset.serviceSchedule?.id,
          serviceDate: recordForm.serviceDate,
          description: recordForm.description,
          cost: recordForm.cost || null,
          provider: recordForm.provider || null,
          notes: recordForm.notes || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create service record');
      }
      
      // Reset form
      setRecordForm({
        serviceDate: new Date().toISOString().split('T')[0],
        description: '',
        cost: '',
        provider: '',
        notes: ''
      });
      
      // Update the UI
      setIsAddingRecord(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error creating service record:', error);
      alert('Failed to create service record');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSchedule = async () => {
    if (!asset.serviceSchedule) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/service-schedules/${asset.serviceSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !asset.serviceSchedule.enabled
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update service schedule');
      }
      
      // Update the UI
      onScheduleUpdated();
    } catch (error) {
      console.error('Error updating service schedule:', error);
      alert('Failed to update service schedule');
    } finally {
      setIsLoading(false);
    }
  };
  
  const initEditForm = () => {
    if (!asset.serviceSchedule) return;
    
    setScheduleForm({
      intervalMonths: asset.serviceSchedule.intervalMonths,
      nextServiceDate: asset.serviceSchedule.nextServiceDate.split('T')[0],
      notes: asset.serviceSchedule.notes || ''
    });
    
    setIsEditing(true);
  };
  
  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset.serviceSchedule) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/service-schedules/${asset.serviceSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intervalMonths: parseInt(scheduleForm.intervalMonths.toString()),
          nextServiceDate: scheduleForm.nextServiceDate,
          notes: scheduleForm.notes || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update service schedule');
      }
      
      // Update the UI
      setIsEditing(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error updating service schedule:', error);
      alert('Failed to update service schedule');
    } finally {
      setIsLoading(false);
    }
  };
  
  // No service schedule exists
  if (!asset.serviceSchedule && !isCreating) {
    return (
      <div className="box">
        <h3 className="title is-4">Service Schedule</h3>
        <div className="notification is-info is-light">
          <p>No service schedule set up for this asset.</p>
        </div>
        <div className="has-text-centered mt-4">
          <button 
            className="button is-primary" 
            onClick={() => setIsCreating(true)}
          >
            Set Up Service Schedule
          </button>
        </div>
      </div>
    );
  }
  
  // Creating a new service schedule
  if (isCreating) {
    return (
      <div className="box">
        <h3 className="title is-4">Create Service Schedule</h3>
        <form onSubmit={handleCreateSchedule}>
          <div className="field">
            <label className="label">Service Interval</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select 
                  value={scheduleForm.intervalMonths} 
                  onChange={(e) => setScheduleForm({...scheduleForm, intervalMonths: parseInt(e.target.value)})}
                  required
                >
                  <option value={3}>Quarterly (Every 3 months)</option>
                  <option value={6}>Bi-annually (Every 6 months)</option>
                  <option value={12}>Annually (Every 12 months)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="field">
            <label className="label">Next Service Date</label>
            <div className="control">
              <input 
                className="input" 
                type="date" 
                value={scheduleForm.nextServiceDate}
                onChange={(e) => setScheduleForm({...scheduleForm, nextServiceDate: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="field">
            <label className="label">Notes</label>
            <div className="control">
              <textarea 
                className="textarea" 
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                placeholder="Any notes about this service schedule"
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
                Create Schedule
              </button>
            </div>
            <div className="control">
              <button 
                type="button" 
                className="button is-light" 
                onClick={() => setIsCreating(false)}
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
  
  // Service schedule exists
  return (
    <div className="box">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-4">Service Schedule</h3>
          </div>
          <div className="level-item">
            <span className={`tag is-medium ${asset.serviceSchedule?.enabled ? 'is-success' : 'is-danger'}`}>
              {asset.serviceSchedule?.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons">
              <button 
                className="button is-small is-info"
                onClick={initEditForm}
                disabled={isLoading || isEditing}
              >
                Edit
              </button>
              <button 
                className={`button is-small ${asset.serviceSchedule?.enabled ? 'is-danger' : 'is-success'}`}
                onClick={handleToggleSchedule}
                disabled={isLoading || isEditing}
              >
                {asset.serviceSchedule?.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isEditing ? (
        <div className="box mt-4 mb-5">
          <h4 className="title is-5">Edit Service Schedule</h4>
          <form onSubmit={handleUpdateSchedule}>
            <div className="field">
              <label className="label">Service Interval</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select 
                    value={scheduleForm.intervalMonths} 
                    onChange={(e) => setScheduleForm({...scheduleForm, intervalMonths: parseInt(e.target.value)})}
                    required
                  >
                    <option value={3}>Quarterly (Every 3 months)</option>
                    <option value={6}>Bi-annually (Every 6 months)</option>
                    <option value={12}>Annually (Every 12 months)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="field">
              <label className="label">Next Service Date</label>
              <div className="control">
                <input 
                  className="input" 
                  type="date" 
                  value={scheduleForm.nextServiceDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, nextServiceDate: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Notes</label>
              <div className="control">
                <textarea 
                  className="textarea" 
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                  placeholder="Any notes about this service schedule"
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
                  Update Schedule
                </button>
              </div>
              <div className="control">
                <button 
                  type="button" 
                  className="button is-light" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="columns">
            <div className="column">
              <div className="field">
                <label className="label">Service Interval</label>
                <p>{intervalLabel(asset.serviceSchedule?.intervalMonths || 0)}</p>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label">Last Service</label>
                <p>{asset.serviceSchedule?.lastServiceDate ? formatDate(asset.serviceSchedule.lastServiceDate) : 'Never'}</p>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label">Next Service Due</label>
                <p>
                  <strong className={new Date(asset.serviceSchedule?.nextServiceDate || '') < new Date() ? 'has-text-danger' : ''}>
                    {formatDate(asset.serviceSchedule?.nextServiceDate || '')}
                  </strong>
                </p>
              </div>
            </div>
          </div>
          
          {asset.serviceSchedule?.notes && (
            <div className="notification is-light mt-3">
              <p><strong>Notes:</strong> {asset.serviceSchedule.notes}</p>
            </div>
          )}
        </>
      )}
      
      {!isEditing && (
        <>
          <hr />
          
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h4 className="title is-5">Service History</h4>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-primary is-small"
                  onClick={() => setIsAddingRecord(true)}
                  disabled={isAddingRecord || !asset.serviceSchedule?.enabled}
                >
                  Add Service Record
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {!isEditing && (
        <>
          {isAddingRecord && (
            <div className="box mb-5">
              <h5 className="title is-6">Add Service Record</h5>
              <form onSubmit={handleAddRecord}>
                <div className="field">
                  <label className="label">Service Date</label>
                  <div className="control">
                    <input 
                      className="input" 
                      type="date" 
                      value={recordForm.serviceDate}
                      onChange={(e) => setRecordForm({...recordForm, serviceDate: e.target.value})}
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
                      value={recordForm.description}
                      onChange={(e) => setRecordForm({...recordForm, description: e.target.value})}
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
                          value={recordForm.cost}
                          onChange={(e) => setRecordForm({...recordForm, cost: e.target.value})}
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
                          value={recordForm.provider}
                          onChange={(e) => setRecordForm({...recordForm, provider: e.target.value})}
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
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
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
                      onClick={() => setIsAddingRecord(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {asset.serviceSchedule?.serviceRecords && asset.serviceSchedule.serviceRecords.length === 0 ? (
            <div className="notification is-info is-light">
              No service records found for this asset.
            </div>
          ) : (
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Provider</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.serviceSchedule?.serviceRecords.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.serviceDate)}</td>
                      <td>{record.description}</td>
                      <td>{record.provider || '-'}</td>
                      <td>{formatCurrency(record.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}