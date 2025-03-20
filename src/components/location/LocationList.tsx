import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import LocationListEntry from './LocationListEntry';

export async function LocationList() {
  const locations = await prisma.location.findMany({
    include: {
      assets: {
        include: {
          category: true,
        },
      },
    },
  });

  return (
    <>
      {locations.length === 0 ? (
        <div className="box has-text-centered p-6">
          <p className="mb-4">
            <span className="icon is-large has-text-grey-light">
              <i className="fas fa-map-marker-alt fa-3x"></i>
            </span>
          </p>
          <p className="title is-5 has-text-grey">No locations found</p>
          <p className="subtitle is-6 has-text-grey-light mb-5">
            You haven&apos;t added any locations yet. Add your first location to start tracking
            assets.
          </p>
          <Link href="/locations/new" className="button is-primary">
            <span className="icon">
              <i className="fas fa-plus"></i>
            </span>
            <span>Add New Location</span>
          </Link>
        </div>
      ) : (
        locations.map(location => <LocationListEntry key={location.id} location={location} />)
      )}
    </>
  );
}

export function LocationListFallback() {
  return (
    <>
      <div className="skeleton-block mt-4"></div>
      <div className="skeleton-block mt-4"></div>
      <div className="skeleton-block mt-4"></div>
    </>
  );
}
