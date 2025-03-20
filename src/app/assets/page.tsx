'use client';

import AssetTable from '../components/assets/AssetTable';
import AssetCategoryFilter from '../components/assets/AssetCategoryFilter';
import { useState } from 'react';

export default function AssetsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleCategorySelected = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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
            <AssetCategoryFilter onCategorySelected={handleCategorySelected} />
          </div>

          <div className="column">
            <AssetTable categoryId={selectedCategoryId} />
          </div>
        </div>
      </section>
    </div>
  );
}
