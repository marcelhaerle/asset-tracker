import Link from 'next/link';
import { Suspense } from 'react';

import { EmployeeList, EmployeeListFallback } from '@/components/employee/EmployeeList';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Employee Management</h1>
            <h2 className="subtitle">Manage employees and their assigned assets</h2>
          </div>
          <div className="column is-narrow">
            <Link href="/employees/new" className="button is-primary">
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add New Employee</span>
            </Link>
          </div>
        </div>

        <Suspense fallback={<EmployeeListFallback />}>
          <EmployeeList />
        </Suspense>
      </section>
    </div>
  );
}
