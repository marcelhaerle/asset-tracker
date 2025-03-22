export type ServiceRecord = {
  id: string;
  serviceDate: string;
  description: string;
  cost: number | null;
  provider: string | null;
  notes: string | null;
};

export type ServiceSchedule = {
  id: string;
  enabled: boolean;
  intervalMonths: number;
  lastServiceDate: string | null;
  nextServiceDate: string;
  notes: string | null;
  serviceRecords: ServiceRecord[];
};

export type AssetWithServiceSchedule = {
  id: string;
  name: string;
  assetTag: string;
  serviceSchedule: ServiceSchedule | null;
};

export interface ScheduleFormData {
  intervalMonths: number;
  nextServiceDate: string;
  notes: string;
}

export interface RecordFormData {
  serviceDate: string;
  description: string;
  cost: string;
  provider: string;
  notes: string;
}