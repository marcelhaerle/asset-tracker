type AssetWithCheckoutHistory = {
  id: string;
  assetTag: string;
  name: string;
  serialNumber: string | null;
  description: string | null;
  model: string | null;
  manufacturer: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  expectedLifespan: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  checkoutHistory: {
    id: string;
    checkedOutAt: string;
    returnedAt: string | null;
    notes: string | null;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeId: string;
    };
  }[];
};

export default function AssetCheckoutHistory({ asset }: { asset: AssetWithCheckoutHistory }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="box">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-4">Checkout History</h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button className="button is-small is-primary">
              <span className="icon is-small">
                <i className="fas fa-exchange-alt"></i>
              </span>
              <span>Check Out/In</span>
            </button>
          </div>
        </div>
      </div>

      {asset.checkoutHistory.length === 0 ? (
        <div className="notification is-info is-light">No checkout history for this asset.</div>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Checked Out</th>
                <th>Returned</th>
                <th>Employee</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {asset.checkoutHistory.map(record => (
                <tr key={record.id}>
                  <td>{formatDate(record.checkedOutAt)}</td>
                  <td>{record.returnedAt ? formatDate(record.returnedAt) : 'Not returned'}</td>
                  <td>{`${record.employee.firstName} ${record.employee.lastName} (${record.employee.employeeId})`}</td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
