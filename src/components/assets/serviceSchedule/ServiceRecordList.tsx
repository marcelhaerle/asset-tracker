import { ServiceRecord } from './types';
import { formatCurrency, formatDate } from './utils';

interface ServiceRecordListProps {
  records: ServiceRecord[];
}

export default function ServiceRecordList({ records }: ServiceRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="notification is-info is-light">
        No service records found for this asset.
      </div>
    );
  }

  return (
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
          {records.map(record => (
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
  );
}