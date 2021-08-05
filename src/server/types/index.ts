export interface PreparingPatientForBroadcast {
  id: number;
  name: string;
  currentTreatmentSite: { displayName: string };
}

export class TreatingPatient {
  constructor(id: number, remindTime: number, name: string) {
    this.id = id;
    this.remindTime = remindTime;
    this.name = name;
  }
  id: number;
  remindTime: number;
  isTreating: boolean = false;
  name: string;
}

export interface ButtonDto {
  hardwareId: string;
}
