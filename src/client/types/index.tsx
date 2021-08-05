export interface Patient {
  id: number;

  name: string;

  patientId: string;

  treatments?: Treatment[];

  dateOfBirth: string;

  gender: "male" | "female";

  medicalRecords: {
    timestamp: string;
    doctorName: string;
  }[];

  ICCardId: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface Treatment {
  id: number;

  patient: Patient;

  section: "morning" | "afternoon" | "night";

  treatmentSchedules?: TreatmentSchedule[];

  stoppingStatus: boolean;

  treatmentPosition: string;

  detail: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface TreatmentItem {
  id: number;

  treatmentCode: string;

  displayName: string;

  duration: number; // millisecond
}

export interface TreatmentSchedule {
  id: number;

  treatment: Treatment;

  treatmentItems?: TreatmentItem[];

  treatmentSite: TreatmentSite;

  postponeTime: number; // -1 is stop until start manually

  remainTime: number; // not sure need or not

  status: "inQueue" | "onSeat" | "treating" | "pause" | "stop" | "end"; //pause is on sit and keep remind time, stop is out of sit

  createdAt: Date;

  UpdatedAt: Date;

  skip: boolean;

  follow: boolean;
}

export interface TreatmentSeat {
  id: number;

  treatmentSite: TreatmentSite;

  treatmentItems?: TreatmentItem[];

  buttonId: string;

  currentTreatmentSchedule?: TreatmentSchedule;
}

export interface TreatmentSite {
  id: number;

  name: string;

  treatmentSeats?: TreatmentSeat[];
}
