import { prisma } from '@/lib/prisma';

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    include: {
      assets: {
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
            <h1 className="title is-2">Location Management</h1>
            <h2 className="subtitle">Manage asset locations</h2>
          </div>
          <div className="column is-narrow">
            <button className="button is-primary">Add New Location</button>
          </div>
        </div>

        {locations.map((location) => (
          <div key={location.id} className="box mb-5">
            <div className="columns">
              <div className="column is-one-third">
                <h3 className="title is-4">{location.name}</h3>
                <div className="content">
                  {location.description && (
                    <p>{location.description}</p>
                  )}
                  <div className="field">
                    <label className="label is-small">Building</label>
                    <p>{location.building || 'Not specified'}</p>
                  </div>
                  <div className="field">
                    <label className="label is-small">Floor</label>
                    <p>{location.floor || 'Not specified'}</p>
                  </div>
                  <div className="field">
                    <label className="label is-small">Room</label>
                    <p>{location.room || 'Not specified'}</p>
                  </div>
                  <div className="field">
                    <label className="label is-small">Address</label>
                    <p>{location.address || 'Not specified'}</p>
                  </div>
                </div>
                <div className="buttons">
                  <button className="button is-info is-small">Edit</button>
                  <button className="button is-danger is-small">Delete</button>
                </div>
              </div>

              <div className="column">
                <h4 className="title is-5">Assets at this location ({location.assets.length})</h4>
                {location.assets.length > 0 ? (
                  <div className="table-container">
                    <table className="table is-fullwidth is-striped is-hoverable is-narrow">
                      <thead>
                        <tr>
                          <th>Asset Tag</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {location.assets.map((asset) => (
                          <tr key={asset.id}>
                            <td>{asset.assetTag}</td>
                            <td>{asset.name}</td>
                            <td>{asset.category.name}</td>
                            <td>
                              <span className="tag">
                                {asset.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="notification is-info is-light">
                    No assets are currently at this location.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}