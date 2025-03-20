import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Asset Tracker",
  description: "Track and manage company assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar is-light" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a className="navbar-item" href="/">
              <span className="has-text-weight-bold is-size-4">Asset Tracker</span>
            </a>
          </div>
          <div className="navbar-menu">
            <div className="navbar-start">
              <a className="navbar-item" href="/">
                Home
              </a>
              <a className="navbar-item" href="/assets">
                Assets
              </a>
              <a className="navbar-item" href="/employees">
                Employees
              </a>
              <a className="navbar-item" href="/locations">
                Locations
              </a>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
        <footer className="footer has-background-light">
          <div className="content has-text-centered">
            <p>
              <strong>Asset Tracker</strong> by Company. Track and manage your company assets efficiently.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
