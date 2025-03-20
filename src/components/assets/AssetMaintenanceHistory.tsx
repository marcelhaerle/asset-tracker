type MaintenanceRecord = {
  id: string;
  date: string;
  description: string;
  cost: number | null;
  provider: string | null;
};

export default function AssetMaintenanceHistory({
  maintenanceRecords,
}: {
  maintenanceRecords: MaintenanceRecord[];
}) {
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

  return (
    <div className="box">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-4">Maintenance History</h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button className="button is-small is-primary">
              <span className="icon is-small">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {maintenanceRecords.length === 0 ? (
        <div className="notification is-info is-light">
          No maintenance records found for this asset.
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
              {maintenanceRecords.map(record => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.description}</td>
                  <td>{record.provider || '-'}</td>
                  <td>{formatCurrency(record.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
