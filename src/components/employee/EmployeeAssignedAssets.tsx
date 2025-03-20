import Link from 'next/link';

type AssignedAsset = {
  id: string;
  name: string;
  assetTag: string;
  status: string;
  category: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  } | null;
};

export default function EmployeeAssignedAssets({
  employeeId,
  assignedAssets,
}: {
  employeeId: string;
  assignedAssets: AssignedAsset[];
}) {
  return (
    <div className="box">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-4">Assigned Assets</h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link href={`/employees/${employeeId}/assign`} className="button is-small is-primary">
              <span className="icon is-small">
                <i className="fas fa-plus"></i>
              </span>
              <span>Assign Asset</span>
            </Link>
          </div>
        </div>
      </div>

      {assignedAssets.length === 0 ? (
        <div className="notification is-info is-light">
          No assets currently assigned to this employee.
        </div>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedAssets.map(asset => (
                <tr key={asset.id}>
                  <td>{asset.assetTag}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category.name}</td>
                  <td>{asset.location ? asset.location.name : 'Not specified'}</td>
                  <td>
                    <span
                      className={`tag ${
                        asset.status === 'AVAILABLE'
                          ? 'is-success'
                          : asset.status === 'IN_USE'
                            ? 'is-info'
                            : asset.status === 'IN_REPAIR'
                              ? 'is-warning'
                              : asset.status === 'RETIRED'
                                ? 'is-light'
                                : 'is-danger'
                      }`}
                    >
                      {asset.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <Link href={`/assets/${asset.id}`} className="button is-small is-info is-light">
                      <span className="icon is-small">
                        <i className="fas fa-eye"></i>
                      </span>
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
