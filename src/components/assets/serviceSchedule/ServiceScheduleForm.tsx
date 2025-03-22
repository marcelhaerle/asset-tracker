import { useState } from 'react';
import { AssetWithServiceSchedule, ScheduleFormData } from './types';

interface ServiceScheduleFormProps {
  asset: AssetWithServiceSchedule;
  initialData?: ScheduleFormData;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  isEditMode?: boolean;
}

export default function ServiceScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditMode = false,
}: ServiceScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>(
    initialData || {
      intervalMonths: 3,
      nextServiceDate: new Date().toISOString().split('T')[0],
      notes: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="box">
      <h3 className="title is-4">{isEditMode ? 'Edit' : 'Create'} Service Schedule</h3>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Service Interval</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select
                value={formData.intervalMonths}
                onChange={e =>
                  setFormData({ ...formData, intervalMonths: parseInt(e.target.value) })
                }
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
              value={formData.nextServiceDate}
              onChange={e => setFormData({ ...formData, nextServiceDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Notes</label>
          <div className="control">
            <textarea
              className="textarea"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              {isEditMode ? 'Update' : 'Create'} Schedule
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
