import Link from 'next/link';

export default async function Nav() {
  return (
    <nav className="navbar is-light" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" href="/">
          <span className="has-text-weight-bold is-size-4">Asset Tracker</span>
        </Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          <Link className="navbar-item" href="/">
            Home
          </Link>
          <Link className="navbar-item" href="/assets">
            Assets
          </Link>
          <Link className="navbar-item" href="/employees">
            Employees
          </Link>
          <Link className="navbar-item" href="/locations">
            Locations
          </Link>
          <Link className="navbar-item" href="/categories">
            Categories
          </Link>
          <Link className="navbar-item" href="/checkouts">
            Checkouts
          </Link>
        </div>
      </div>
    </nav>
  );
}
