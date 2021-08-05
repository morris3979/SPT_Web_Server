import Axios from "axios";
import { Treatment, TreatmentItem } from "../types";

export const getTreatments = async (): Promise<Treatment[]> => {
  return (await Axios.get("/api/treatments")).data;
};

export const getStoppingTreatments = async (): Promise<Treatment[]> => {
  return (await Axios.get("/api/treatments/stopping")).data;
};

export const createTreatment = async (
  patientId: string,
  patientName: string,
  medicalRecords: string,
  gender: string,
  dateOfBirth: string,
  ICCardId: string,
  section: string
): Promise<number> => {
  return (
    await Axios.post("/api/treatments", {
      patient: {
        patientId,
        name: patientName,
        medicalRecords,
        gender,
        dateOfBirth,
        ICCardId,
      },
      section,
    })
  ).data.id;
};

export const createTreatmentSchedulesInTreatment = async (
  id: number,
  items: TreatmentItem[],
  bind: string[][],
  sort: string[][],
  follow: string[][]
) => {
  await Axios.post(`/api/treatments/${id}/treatmentSchedules`, {
    items,
    bind,
    sort,
    follow,
  });
};

export const changeTreatmentStopping = async (
  id: number,
  value: { section: "morning" | "afternoon" | "night"; value: boolean }
) => {
  await Axios.patch(`/api/treatments/${id}/stopping`, value);
};
