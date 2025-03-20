type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  isActive: boolean;
};

export default function EmployeeDetails({ employee }: { employee: Employee }) {
  return (
    <div className="box">
      <h3 className="title is-4 mb-4">Employee Information</h3>

      <div className="tags mb-5">
        <span className={`tag ${employee.isActive ? 'is-success' : 'is-danger'} is-medium`}>
          {employee.isActive ? 'Active' : 'Inactive'}
        </span>
        {employee.department && (
          <span className="tag is-info is-medium">{employee.department}</span>
        )}
      </div>

      <div className="field">
        <label className="label">Email</label>
        <p>{employee.email}</p>
      </div>

      {employee.position && (
        <div className="field">
          <label className="label">Position</label>
          <p>{employee.position}</p>
        </div>
      )}

      {employee.phone && (
        <div className="field">
          <label className="label">Phone</label>
          <p>{employee.phone}</p>
        </div>
      )}
    </div>
  );
}
