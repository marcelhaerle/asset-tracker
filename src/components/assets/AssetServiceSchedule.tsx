import { useState } from 'react';
import {
  AssetWithServiceSchedule,
  ScheduleFormData,
  RecordFormData,
} from './serviceSchedule/types';
import EmptySchedule from './serviceSchedule/EmptySchedule';
import ServiceScheduleForm from './serviceSchedule/ServiceScheduleForm';
import ServiceScheduleDetails from './serviceSchedule/ServiceScheduleDetails';
import ServiceHistoryHeader from './serviceSchedule/ServiceHistoryHeader';
import ServiceRecordForm from './serviceSchedule/ServiceRecordForm';
import ServiceRecordList from './serviceSchedule/ServiceRecordList';

interface AssetServiceScheduleProps {
  asset: AssetWithServiceSchedule;
  onScheduleUpdated: () => void;
}

export default function AssetServiceSchedule({
  asset,
  onScheduleUpdated,
}: AssetServiceScheduleProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSchedule = async (data: ScheduleFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/service-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: asset.id,
          intervalMonths: parseInt(data.intervalMonths.toString()),
          nextServiceDate: data.nextServiceDate,
          notes: data.notes || null,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to create service schedule');
      }

      // Update the UI
      setIsCreating(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error creating service schedule:', error);
      alert('Failed to create service schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async (data: RecordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/service-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceScheduleId: asset.serviceSchedule?.id,
          serviceDate: data.serviceDate,
          description: data.description,
          cost: data.cost || null,
          provider: data.provider || null,
          notes: data.notes || null,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to create service record');
      }

      // Update the UI
      setIsAddingRecord(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error creating service record:', error);
      alert('Failed to create service record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSchedule = async () => {
    if (!asset.serviceSchedule) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/service-schedules/${asset.serviceSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !asset.serviceSchedule.enabled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update service schedule');
      }

      // Update the UI
      onScheduleUpdated();
    } catch (error) {
      console.error('Error updating service schedule:', error);
      alert('Failed to update service schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchedule = async (data: ScheduleFormData) => {
    if (!asset.serviceSchedule) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/service-schedules/${asset.serviceSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intervalMonths: parseInt(data.intervalMonths.toString()),
          nextServiceDate: data.nextServiceDate,
          notes: data.notes || null,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update service schedule');
      }

      // Update the UI
      setIsEditing(false);
      onScheduleUpdated();
    } catch (error) {
      console.error('Error updating service schedule:', error);
      alert('Failed to update service schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const initEditForm = () => {
    if (!asset.serviceSchedule) return;
    setIsEditing(true);
  };

  // No service schedule exists
  if (!asset.serviceSchedule && !isCreating) {
    return <EmptySchedule onCreateClick={() => setIsCreating(true)} />;
  }

  // Creating a new service schedule
  if (isCreating) {
    return (
      <ServiceScheduleForm
        asset={asset}
        onSubmit={handleCreateSchedule}
        onCancel={() => setIsCreating(false)}
        isLoading={isLoading}
      />
    );
  }

  // Service schedule exists
  return (
    <div className="box">
      {isEditing ? (
        <ServiceScheduleForm
          asset={asset}
          initialData={{
            intervalMonths: asset.serviceSchedule!.intervalMonths,
            nextServiceDate: asset.serviceSchedule!.nextServiceDate.split('T')[0],
            notes: asset.serviceSchedule!.notes || '',
          }}
          onSubmit={handleUpdateSchedule}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
          isEditMode={true}
        />
      ) : (
        <ServiceScheduleDetails
          asset={asset}
          onEdit={initEditForm}
          onToggle={handleToggleSchedule}
          isLoading={isLoading}
        />
      )}

      {!isEditing && asset.serviceSchedule && (
        <ServiceHistoryHeader
          onAddRecord={() => setIsAddingRecord(true)}
          isScheduleEnabled={asset.serviceSchedule.enabled}
          isAddingRecord={isAddingRecord}
        />
      )}

      {!isEditing && isAddingRecord && (
        <ServiceRecordForm
          onSubmit={handleAddRecord}
          onCancel={() => setIsAddingRecord(false)}
          isLoading={isLoading}
        />
      )}

      {!isEditing && asset.serviceSchedule && (
        <ServiceRecordList records={asset.serviceSchedule.serviceRecords} />
      )}
    </div>
  );
}
