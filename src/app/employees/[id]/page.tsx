'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import DeleteEmployeeButton from '@/components/employee/DeleteEmployeeButton';
import EmployeeAssignedAssets from '@/components/employee/EmployeeAssignedAssets';
import EmployeeCheckoutHistory from '@/components/employee/EmployeeCheckoutHistory';
import EmployeeDetails from '@/components/employee/EmployeeDetails';

type EmployeeWithRelations = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  isActive: boolean;
  assignedAssets: {
    id: string;
    name: string;
    assetTag: string;
    status: string;
    category: {
      id: string;
      name: string;
    };
    location: {
      id: string;
      name: string;
    } | null;
  }[];
  checkoutHistory: {
    id: string;
    checkedOutAt: string;
    returnedAt: string | null;
    notes: string | null;
    asset: {
      id: string;
      name: string;
      assetTag: string;
      category: {
        id: string;
        name: string;
      };
    };
  }[];
};

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/employees/${employeeId}`);

        if (response.status === 404) {
          setError('Employee not found');
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch employee details');
        }

        const data = await response.json();
        setEmployee(data.employee);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching employee data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <section className="section">
          <div className="has-text-centered py-6">
            <span className="icon is-large">
              <i className="fas fa-spinner fa-pulse fa-3x"></i>
            </span>
            <p className="mt-4">Loading employee details...</p>
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
                <p className="title is-4">Error Loading Employee</p>
                <p className="mb-5">{error}</p>
                <button onClick={() => router.push('/employees')} className="button is-primary">
                  Return to Employees
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Employee not found
  if (!employee) {
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
                <p className="title is-4">Employee Not Found</p>
                <p className="mb-5">
                  The employee you're looking for doesn't exist or has been removed.
                </p>
                <button onClick={() => router.push('/employees')} className="button is-primary">
                  Return to Employees
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
                <h1 className="title is-2">
                  {employee.firstName} {employee.lastName}
                </h1>
                <h2 className="subtitle">Employee ID: {employee.employeeId}</h2>
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="buttons">
                <Link href={`/employees/${employeeId}/edit`} className="button is-warning">
                  <span className="icon">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span>Edit Employee</span>
                </Link>
                <Link href={`/employees/${employeeId}/assign`} className="button is-info">
                  <span className="icon">
                    <i className="fas fa-laptop"></i>
                  </span>
                  <span>Assign Asset</span>
                </Link>
                <DeleteEmployeeButton
                  employeeId={employeeId}
                  firstName={employee.firstName}
                  lastName={employee.lastName}
                  employeeIdNumber={employee.employeeId}
                />
                <Link href="/employees" className="button is-light">
                  <span className="icon">
                    <i className="fas fa-arrow-left"></i>
                  </span>
                  <span>Back to Employees</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third">
            <EmployeeDetails employee={employee} />
          </div>

          <div className="column">
            <EmployeeAssignedAssets
              employeeId={employeeId}
              assignedAssets={employee.assignedAssets}
            />

            <EmployeeCheckoutHistory checkoutHistory={employee.checkoutHistory} />
          </div>
        </div>
      </section>
    </div>
  );
}
