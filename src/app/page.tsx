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

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company Asset Tracker</h1>
        <p className="text-gray-500">Manage and track your company's physical assets</p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Asset Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Assets</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Asset Tag</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{asset.assetTag}</td>
                  <td className="py-3 px-4 text-sm">{asset.name}</td>
                  <td className="py-3 px-4 text-sm">{asset.category.name}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs 
                      ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                        asset.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' : 
                        asset.status === 'IN_REPAIR' ? 'bg-yellow-100 text-yellow-800' : 
                        asset.status === 'RETIRED' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{asset.location?.name || '-'}</td>
                  <td className="py-3 px-4 text-sm">
                    {asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
