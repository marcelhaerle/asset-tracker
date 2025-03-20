import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { Suspense } from 'react';
import { LocationList, LocationListFallback } from '../components/location/LocationList';

export default async function LocationsPage() {
  // Disable caching for this page to show latest data
  noStore();

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Location Management</h1>
            <h2 className="subtitle">Manage asset locations</h2>
          </div>
          <div className="column is-narrow">
            <Link href="/locations/new" className="button is-primary">
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add New Location</span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<LocationListFallback />}>
          <LocationList />
        </Suspense>
      </section>
    </div>
  );
}
