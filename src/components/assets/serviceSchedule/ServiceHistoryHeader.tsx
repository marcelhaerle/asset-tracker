interface ServiceHistoryHeaderProps {
  onAddRecord: () => void;
  isScheduleEnabled: boolean;
  isAddingRecord: boolean;
}

export default function ServiceHistoryHeader({
  onAddRecord,
  isScheduleEnabled,
  isAddingRecord
}: ServiceHistoryHeaderProps) {
  return (
    <>
      <hr />
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h4 className="title is-5">Service History</h4>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button 
              className="button is-primary is-small"
              onClick={onAddRecord}
              disabled={isAddingRecord || !isScheduleEnabled}
            >
              Add Service Record
            </button>
          </div>
        </div>
      </div>
    </>
  );
}