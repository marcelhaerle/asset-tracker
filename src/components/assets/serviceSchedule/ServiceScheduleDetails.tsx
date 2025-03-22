import { AssetWithServiceSchedule } from './types';
import { formatDate, intervalLabel } from './utils';

interface ServiceScheduleDetailsProps {
  asset: AssetWithServiceSchedule;
  onEdit: () => void;
  onToggle: () => void;
  isLoading: boolean;
}

export default function ServiceScheduleDetails({
  asset,
  onEdit,
  onToggle,
  isLoading
}: ServiceScheduleDetailsProps) {
  if (!asset.serviceSchedule) return null;
  
  return (
    <>
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-4">Service Schedule</h3>
          </div>
          <div className="level-item">
            <span className={`tag is-medium ${asset.serviceSchedule.enabled ? 'is-success' : 'is-danger'}`}>
              {asset.serviceSchedule.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons">
              <button 
                className="button is-small is-info"
                onClick={onEdit}
                disabled={isLoading}
              >
                Edit
              </button>
              <button 
                className={`button is-small ${asset.serviceSchedule.enabled ? 'is-danger' : 'is-success'}`}
                onClick={onToggle}
                disabled={isLoading}
              >
                {asset.serviceSchedule.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
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
            <p>{asset.serviceSchedule.lastServiceDate ? formatDate(asset.serviceSchedule.lastServiceDate) : 'Never'}</p>
          </div>
        </div>
        <div className="column">
          <div className="field">
            <label className="label">Next Service Due</label>
            <p>
              <strong className={new Date(asset.serviceSchedule.nextServiceDate) < new Date() ? 'has-text-danger' : ''}>
                {formatDate(asset.serviceSchedule.nextServiceDate)}
              </strong>
            </p>
          </div>
        </div>
      </div>
      
      {asset.serviceSchedule.notes && (
        <div className="notification is-light mt-3">
          <p><strong>Notes:</strong> {asset.serviceSchedule.notes}</p>
        </div>
      )}
    </>
  );
}