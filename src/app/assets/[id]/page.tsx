'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import DeleteAssetButton from '@/components/assets/DeleteAssetButton';
import AssetCheckoutHistory from '@/components/assets/AssetCheckoutHistory';
import AssetMetadata from '@/components/assets/AssetMetadata';
import AssetAssignment from '@/components/assets/AssetAssignment';
import AssetLocation from '@/components/assets/AssetLocation';
import AssetMaintenanceHistory from '@/components/assets/AssetMaintenanceHistory';
import AssetServiceSchedule from '@/components/assets/AssetServiceSchedule';
import AssetDetails from '@/components/assets/AssetDetails';

type ServiceRecord = {
  id: string;
  serviceDate: string;
  description: string;
  cost: number | null;
  provider: string | null;
  notes: string | null;
};

type ServiceSchedule = {
  id: string;
  enabled: boolean;
  intervalMonths: number;
  lastServiceDate: string | null;
  nextServiceDate: string;
  notes: string | null;
  serviceRecords: ServiceRecord[];
};

type AssetWithRelations = {
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
  location: {
    id: string;
    name: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
  } | null;
  maintenanceRecords: {
    id: string;
    date: string;
    description: string;
    cost: number | null;
    provider: string | null;
  }[];
  checkoutHistory: {
    id: string;
    checkedOutAt: string;
    returnedAt: string | null;
    notes: string | null;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeId: string;
    };
  }[];
  serviceSchedule: ServiceSchedule | null;
};

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<AssetWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`);

        if (response.status === 404) {
          setError('Asset not found');
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch asset details');
        }

        const data = await response.json();
        setAsset(data.asset);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, refreshKey]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <section className="section">
          <div className="has-text-centered py-6">
            <span className="icon is-large">
              <i className="fas fa-spinner fa-pulse fa-3x"></i>
            </span>
            <p className="mt-4">Loading asset details...</p>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <section className="section">
          <div className="columns">
            <div className="column is-half is-offset-one-quarter">
              <div className="box has-text-centered p-6">
                <p className="mb-4">
                  <span className="icon is-large has-text-danger">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                  </span>
                </p>
                <p className="title is-4">Error Loading Asset</p>
                <p className="mb-5">{error}</p>
                <button onClick={() => router.push('/assets')} className="button is-primary">
                  Return to Assets
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Asset not found
  if (!asset) {
    return (
      <div className="container">
        <section className="section">
          <div className="columns">
            <div className="column is-half is-offset-one-quarter">
              <div className="box has-text-centered p-6">
                <p className="mb-4">
                  <span className="icon is-large has-text-danger">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                  </span>
                </p>
                <p className="title is-4">Asset Not Found</p>
                <p className="mb-5">
                  The asset you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <button onClick={() => router.push('/assets')} className="button is-primary">
                  Return to Assets
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        {/* Header with actions */}
        <div className="level mb-5">
          <div className="level-left">
            <div className="level-item">
              <div>
                <h1 className="title is-2">{asset.name}</h1>
                <h2 className="subtitle">Asset Tag: {asset.assetTag}</h2>
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="buttons">
                <Link href={`/assets/${assetId}/edit`} className="button is-warning">
                  <span className="icon">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span>Edit Asset</span>
                </Link>
                <DeleteAssetButton
                  assetId={assetId}
                  assetName={asset.name}
                  assetTag={asset.assetTag}
                />
                <Link href="/assets" className="button is-light">
                  <span className="icon">
                    <i className="fas fa-arrow-left"></i>
                  </span>
                  <span>Back to Assets</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="columns">
          {/* Main asset details */}
          <div className="column is-two-thirds">
            <AssetDetails asset={asset} />
            <AssetServiceSchedule
              asset={asset}
              onScheduleUpdated={() => setRefreshKey(prev => prev + 1)}
            />
            <AssetMaintenanceHistory maintenanceRecords={asset.maintenanceRecords} />
            <AssetCheckoutHistory
              asset={asset}
              onCheckoutUpdated={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Sidebar */}
          <div className="column">
            <AssetLocation location={asset.location} />
            <AssetAssignment assignedTo={asset.assignedTo} />
            <AssetMetadata id={asset.id} createdAt={asset.createdAt} updatedAt={asset.updatedAt} />
          </div>
        </div>
      </section>
    </div>
  );
}
