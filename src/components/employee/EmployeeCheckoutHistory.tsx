import Link from 'next/link';

type CheckoutHistory = {
  id: string;
  checkedOutAt: string;
  returnedAt: string | null;
  notes: string | null;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    category: {
      id: string;
      name: string;
    };
  };
};

export default function EmployeeCheckoutHistory({
  checkoutHistory,
}: {
  checkoutHistory: CheckoutHistory[];
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="box">
      <h3 className="title is-4 mb-4">Checkout History</h3>

      {checkoutHistory.length === 0 ? (
        <div className="notification is-info is-light">No checkout history for this employee.</div>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Checked Out</th>
                <th>Returned</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {checkoutHistory.map(record => (
                <tr key={record.id}>
                  <td>
                    <Link href={`/assets/${record.asset.id}`}>
                      {record.asset.name} ({record.asset.assetTag})
                    </Link>
                  </td>
                  <td>{record.asset.category.name}</td>
                  <td>{formatDate(record.checkedOutAt)}</td>
                  <td>{record.returnedAt ? formatDate(record.returnedAt) : 'Not returned'}</td>
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
