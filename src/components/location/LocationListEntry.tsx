import Link from 'next/link';

import { Asset } from '@prisma/client';

type LocationWithAssets = {
  id: string;
  name: string;
  description: string | null;
  building: string | null;
  floor: string | null;
  room: string | null;
  address: string | null;
  assets: Asset[];
};

type LocationListEntryProps = {
  location: LocationWithAssets;
};

export default function LocationListEntry({ location }: LocationListEntryProps) {
  return (
    <div className="column is-one-third">
      <div key={location.id} className="box mb-5">
        <h3 className="title is-4">{location.name}</h3>
        <div className="mb-4">
          <span className="tag is-dark">{location.assets.length} assets</span>
        </div>
        <div className="content">
          {location.description && <p>{location.description}</p>}
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
          <Link href={`/locations/${location.id}`} className="button is-info is-small">
            <span className="icon is-small">
              <i className="fas fa-edit"></i>
            </span>
            <span>View</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
