import Link from 'next/link';

type Location = {
  id: string;
  name: string;
};

export default function AssetLocation({ location }: { location: Location | null }) {
  return (
    <div className="box">
      <h3 className="title is-4 mb-4">Location</h3>

      {location ? (
        <div>
          <p className="is-size-5 mb-3">{location.name}</p>
          <Link href={`/locations`} className="button is-small is-info is-light">
            <span className="icon is-small">
              <i className="fas fa-map-marker-alt"></i>
            </span>
            <span>View Location</span>
          </Link>
        </div>
      ) : (
        <div className="notification is-warning is-light">No location assigned.</div>
      )}
    </div>
  );
}
