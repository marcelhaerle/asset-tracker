import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="navbar is-light" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" href="/">
          <span className="has-text-weight-bold is-size-4">Asset Tracker</span>
        </Link>
      </div>
      <div className="navbar-menu">
        {user && (
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
        )}
        <div className="navbar-end">
          <div className="navbar-item">
            {user ? (
              <div className="buttons">
                <span className="button is-light">
                  <i className="fas fa-user mr-2"></i>
                  {user.name && user.name.length > 0 ? user.name : user.username}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <div className="buttons">
                <Link className="button is-primary" href="/login">
                  <strong>Login</strong>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
