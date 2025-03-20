import Link from 'next/link';

type AssignedTo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
};

export default function AssetAssignment({ assignedTo }: { assignedTo: AssignedTo | null }) {
  return (
    <div className="box">
      <h3 className="title is-4 mb-4">Assignment</h3>

      {assignedTo ? (
        <div>
          <p className="is-size-5 mb-2">{`${assignedTo.firstName} ${assignedTo.lastName}`}</p>
          <p className="is-size-6 mb-3 has-text-grey">{assignedTo.email}</p>
          <p className="is-size-6 mb-3">
            <strong>Employee ID:</strong> {assignedTo.employeeId}
          </p>
          <Link href={`/employees/${assignedTo.id}`} className="button is-small is-info is-light">
            <span className="icon is-small">
              <i className="fas fa-user"></i>
            </span>
            <span>View Employee</span>
          </Link>
        </div>
      ) : (
        <div className="notification is-warning is-light">Not assigned to any employee.</div>
      )}
    </div>
  );
}
