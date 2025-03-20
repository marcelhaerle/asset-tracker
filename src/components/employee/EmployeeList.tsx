import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export async function EmployeeList() {
  const employees = await prisma.employee.findMany({
    include: {
      assignedAssets: {
        include: {
          category: true,
        },
      },
    },
  });

  return (
    <div className="columns is-multiline">
      {employees.map(employee => (
        <div key={employee.id} className="column is-one-third">
          <div className="card">
            <div className="card-content">
              <div className="media">
                <div className="media-content">
                  <p className="title is-4">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="subtitle is-6">{employee.position || 'No position'}</p>
                </div>
              </div>

              <div className="content">
                <div className="field">
                  <label className="label is-small">Employee ID</label>
                  <p>{employee.employeeId}</p>
                </div>
                <div className="field">
                  <label className="label is-small">Department</label>
                  <p>{employee.department || 'Not assigned'}</p>
                </div>
                <div className="field">
                  <label className="label is-small">Email</label>
                  <p>{employee.email}</p>
                </div>
                <div className="field">
                  <label className="label is-small">Status</label>
                  <p>
                    <span className={`tag ${employee.isActive ? 'is-success' : 'is-danger'}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="field">
                  <label className="label is-small">Assigned Assets</label>
                  {employee.assignedAssets.length > 0 ? (
                    <div>
                      {employee.assignedAssets.map(asset => (
                        <div key={asset.id} className="tags has-addons mb-1">
                          <span className="tag is-dark">{asset.category.name}</span>
                          <span className="tag is-info">{asset.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No assets assigned</p>
                  )}
                </div>
              </div>
            </div>
            <footer className="card-footer">
              <Link href={`/employees/${employee.id}`} className="card-footer-item">
                <span className="icon-text">
                  <span className="icon">
                    <i className="fas fa-eye"></i>
                  </span>
                  <span>View</span>
                </span>
              </Link>
              <Link href={`/employees/${employee.id}/edit`} className="card-footer-item">
                <span className="icon-text">
                  <span className="icon">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span>Edit</span>
                </span>
              </Link>
              <Link href={`/employees/${employee.id}/assign`} className="card-footer-item">
                <span className="icon-text">
                  <span className="icon">
                    <i className="fas fa-laptop"></i>
                  </span>
                  <span>Assign</span>
                </span>
              </Link>
            </footer>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmployeeListFallback() {
  return (
    <div className="columns is-multiline">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="column is-one-third">
          <div className="card">
            <div className="card-content">
              <div className="media">
                <div className="media-content">
                  <p className="title is-4">Loading...</p>
                </div>
              </div>
              <div className="content">
                <div className="field">
                  <label className="label is-small">Employee ID</label>
                  <p>Loading...</p>
                </div>
                <div className="field">
                  <label className="label is-small">Department</label>
                  <p>Loading...</p>
                </div>
                <div className="field">
                  <label className="label is-small">Email</label>
                  <p>Loading...</p>
                </div>
                <div className="field">
                  <label className="label is-small">Status</label>
                  <p>
                    <span className="tag is-dark">Loading...</span>
                  </p>
                </div>
                <div className="field">
                  <label className="label is-small">Assigned Assets</label>
                  <p>Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
