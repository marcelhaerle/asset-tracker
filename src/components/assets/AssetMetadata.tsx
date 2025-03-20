type Metadata = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export default function AssetMetadata({ id, createdAt, updatedAt }: Metadata) {
  return (
    <div className="box">
      <h3 className="title is-4 mb-4">Metadata</h3>

      <div className="field">
        <label className="label">Asset ID</label>
        <p className="is-family-monospace">{id}</p>
      </div>

      <div className="field">
        <label className="label">Created</label>
        <p>{new Date(createdAt).toLocaleString()}</p>
      </div>

      <div className="field">
        <label className="label">Last Updated</label>
        <p>{new Date(updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
