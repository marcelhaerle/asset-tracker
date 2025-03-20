type AssetWithCategory = {
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
  category: {
    id: string;
    name: string;
  };
};

export default function AssetDetails({ asset }: { asset: AssetWithCategory }) {
  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'is-available';
      case 'IN_USE':
        return 'is-in-use';
      case 'IN_REPAIR':
        return 'is-in-repair';
      case 'RETIRED':
        return 'is-retired';
      case 'LOST':
        return 'is-lost';
      default:
        return '';
    }
  };

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
      <h3 className="title is-4 mb-4">Asset Information</h3>

      <div className="tags mb-5">
        <span className={`tag ${getStatusClassName(asset.status)} is-medium`}>
          {asset.status.replace('_', ' ')}
        </span>
        <span className="tag is-info is-medium">{asset.category.name}</span>
      </div>

      <div className="columns">
        <div className="column">
          <div className="field">
            <label className="label">Serial Number</label>
            <p>{asset.serialNumber || 'Not specified'}</p>
          </div>

          <div className="field">
            <label className="label">Manufacturer</label>
            <p>{asset.manufacturer || 'Not specified'}</p>
          </div>

          <div className="field">
            <label className="label">Model</label>
            <p>{asset.model || 'Not specified'}</p>
          </div>
        </div>

        <div className="column">
          <div className="field">
            <label className="label">Purchase Date</label>
            <p>{formatDate(asset.purchaseDate)}</p>
          </div>

          <div className="field">
            <label className="label">Purchase Price</label>
            <p>{formatCurrency(asset.purchasePrice)}</p>
          </div>

          <div className="field">
            <label className="label">Expected Lifespan</label>
            <p>{asset.expectedLifespan ? `${asset.expectedLifespan} months` : 'Not specified'}</p>
          </div>
        </div>
      </div>

      {asset.description && (
        <div className="field mt-4">
          <label className="label">Description</label>
          <div className="content">
            <p>{asset.description}</p>
          </div>
        </div>
      )}

      {asset.notes && (
        <div className="field mt-4">
          <label className="label">Notes</label>
          <div className="content">
            <p>{asset.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
