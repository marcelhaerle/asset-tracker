import { prisma } from '@/lib/prisma';

export default async function AssetsPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryId = searchParams.category;
  
  const whereClause = categoryId ? { categoryId } : {};
  
  const assets = await prisma.asset.findMany({
    where: whereClause,
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
            <h1 className="title is-2">Asset Management</h1>
            <h2 className="subtitle">View and manage company assets</h2>
          </div>
          <div className="column is-narrow">
            <button className="button is-primary">Add New Asset</button>
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-quarter">
            <div className="box">
              <h3 className="title is-5">Filter by Category</h3>
              <aside className="menu">
                <ul className="menu-list">
                  <li><a href="/assets" className={!categoryId ? 'is-active' : ''}>All Categories</a></li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <a 
                        href={`/assets?category=${category.id}`}
                        className={categoryId === category.id ? 'is-active' : ''}
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
          
          <div className="column">
            <div className="box">
              <h3 className="title is-4">
                {categoryId 
                  ? `${categories.find(c => c.id === categoryId)?.name || 'Category'} Assets` 
                  : 'All Assets'}
              </h3>
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
                      <th>Actions</th>
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
                        <td>
                          <div className="buttons are-small">
                            <button className="button is-info">View</button>
                            <button className="button is-warning">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}