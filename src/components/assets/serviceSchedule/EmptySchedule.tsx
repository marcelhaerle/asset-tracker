interface EmptyScheduleProps {
  onCreateClick: () => void;
}

export default function EmptySchedule({ onCreateClick }: EmptyScheduleProps) {
  return (
    <div className="box">
      <h3 className="title is-4">Service Schedule</h3>
      <div className="notification is-info is-light">
        <p>No service schedule set up for this asset.</p>
      </div>
      <div className="has-text-centered mt-4">
        <button 
          className="button is-primary" 
          onClick={onCreateClick}
        >
          Set Up Service Schedule
        </button>
      </div>
    </div>
  );
}