'use client';

import { Asset, Category } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AssetTableProps {
  categoryId: string | null;
}

type AssetIncluded = Asset & {
  location: { name: string };
  category: { name: string };
  assignedTo: { firstName: string; lastName: string };
};

export default function AssetTable({ categoryId }: AssetTableProps) {
  const [assets, setAssets] = useState<AssetIncluded[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetIncluded[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data.assets);
        setFilteredAssets(data.assets);
      })
      .catch(err => console.error('Error fetching assets:', err));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    if (categoryId) {
      setFilteredAssets(assets.filter(asset => asset.categoryId === categoryId));
    } else {
      setFilteredAssets(assets);
    }
  }, [categoryId, assets]);

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

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Category';
  };

  return (
    <div className="box">
      <h3 className="title is-4">
        {categoryId ? `${getCategoryName(categoryId)} Assets` : 'All Assets'}
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
            {filteredAssets.map(asset => (
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
                  {asset.assignedTo
                    ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                    : '-'}
                </td>
                <td>
                  <div className="buttons are-small">
                    <Link href={`/assets/${asset.id}`} className="button is-info">
                      View
                    </Link>
                    <Link href={`/assets/${asset.id}/edit`} className="button is-warning">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
