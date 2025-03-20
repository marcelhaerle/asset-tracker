import { prisma } from '@/lib/prisma';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: {
      assignedAssets: {
        include: {
          category: true
        }
      }
    }
  });

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Employee Management</h1>
            <h2 className="subtitle">Manage employees and their assigned assets</h2>
          </div>
          <div className="column is-narrow">
            <button className="button is-primary">Add New Employee</button>
          </div>
        </div>

        <div className="columns is-multiline">
          {employees.map((employee) => (
            <div key={employee.id} className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="media">
                    <div className="media-left">
                      <figure className="image is-48x48">
                        <div className="has-background-grey-light has-text-centered" 
                             style={{ width: '48px', height: '48px', borderRadius: '50%', lineHeight: '48px' }}>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                      </figure>
                    </div>
                    <div className="media-content">
                      <p className="title is-4">{employee.firstName} {employee.lastName}</p>
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
                  <a href="#" className="card-footer-item">View</a>
                  <a href="#" className="card-footer-item">Edit</a>
                  <a href="#" className="card-footer-item">Assign Asset</a>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}