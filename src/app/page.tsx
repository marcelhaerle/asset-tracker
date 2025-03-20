import { prisma } from '@/lib/prisma';

export default async function Home() {
  const assets = await prisma.asset.findMany({
    include: {
      category: true,
      location: true,
      assignedTo: true,
    },
  });

  const categories = await prisma.category.findMany();

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'is-available';
      case 'IN_USE': return 'is-in-use';
      case 'IN_REPAIR': return 'is-in-repair';
      case 'RETIRED': return 'is-retired';
      case 'LOST': return 'is-lost';
      default: return '';
    }
  };

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Company Asset Tracker</h1>
            <h2 className="subtitle">Manage and track your company's physical assets</h2>
          </div>
        </div>
        
        <div className="block mt-6">
          <div className="box">
            <h3 className="title is-4">Asset Overview</h3>
            <div className="columns is-multiline">
              <div className="column is-one-quarter">
                <div className="notification is-info">
                  <p className="title">{assets.length}</p>
                  <p className="subtitle">Total Assets</p>
                </div>
              </div>
              <div className="column is-one-quarter">
                <div className="notification is-success">
                  <p className="title">{assets.filter(a => a.status === 'AVAILABLE').length}</p>
                  <p className="subtitle">Available Assets</p>
                </div>
              </div>
              <div className="column is-one-quarter">
                <div className="notification is-link">
                  <p className="title">{assets.filter(a => a.status === 'IN_USE').length}</p>
                  <p className="subtitle">In Use</p>
                </div>
              </div>
              <div className="column is-one-quarter">
                <div className="notification is-warning">
                  <p className="title">{assets.filter(a => a.status === 'IN_REPAIR').length}</p>
                  <p className="subtitle">In Repair</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block mt-6">
          <div className="box">
            <h3 className="title is-4">Asset Categories</h3>
            <div className="columns is-multiline">
              {categories.map((category) => (
                <div key={category.id} className="column is-one-quarter">
                  <div className="card">
                    <div className="card-content">
                      <p className="title is-5">{category.name}</p>
                      <p className="subtitle is-6">{category.description}</p>
                    </div>
                    <footer className="card-footer">
                      <a href={`/assets?category=${category.id}`} className="card-footer-item">
                        View Assets
                      </a>
                    </footer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="block mt-6">
          <div className="box">
            <h3 className="title is-4">Asset Listing</h3>
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.assetTag}</td>
                      <td>{asset.name}</td>
                      <td>{asset.category.name}</td>
                      <td>
                        <span className={`tag ${getStatusClassName(asset.status)}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{asset.location?.name || '-'}</td>
                      <td>
                        {asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
