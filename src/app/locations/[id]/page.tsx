import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { LocationDetail, LocationDetailFallback } from '@/components/location/LocationDetail';
import { prisma } from '@/lib/prisma';
import DeleteLocationButton from '@/components/location/DeleteLocationButton';

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locationId = (await params).id;

  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
    include: {
      assets: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!location) {
    return redirect('/locations');
  }

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Location Details</h1>
            <h2 className="subtitle">View location details</h2>
          </div>
          <div className="column is-narrow">
            <div className="buttons">
              <Link href={`/locations/${locationId}/edit`} className="button is-warning">
                <span className="icon">
                  <i className="fas fa-edit"></i>
                </span>
                <span>Edit Location</span>
              </Link>
              <DeleteLocationButton location={location} />
              <Link href="/locations" className="button is-light">
                <span className="icon">
                  <i className="fas fa-arrow-left"></i>
                </span>
                <span>Back to Locations</span>
              </Link>
            </div>
          </div>
        </div>
        <Suspense fallback={<LocationDetailFallback />}>
          <LocationDetail location={location} />
        </Suspense>
      </section>
    </div>
  );
}
