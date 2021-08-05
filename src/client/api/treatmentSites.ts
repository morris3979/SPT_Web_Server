import axios from "axios";
import {
  Treatment,
  TreatmentSchedule,
  TreatmentSeat,
  TreatmentSite,
} from "../types";

export const getTreatmentSites = async (): Promise<TreatmentSite[]> => {
  return (await axios.get("/api/treatmentSites")).data;
};

export const creatTreatmentSite = async (name: string): Promise<void> => {
  await axios.post("/api/treatmentSites", { name });
};

export const changeTreatmentSite = async (
  id: number,
  name?: string
): Promise<void> => {
  await axios.patch(`/api/treatmentSites/${id}`, { name });
};

export const deleteTreatmentSite = async (id: number): Promise<void> => {
  await axios.delete(`/api/treatmentSites/${id}`);
};

export const getTreatmentSeatsInTreatmentSite = async (
  id: number
): Promise<TreatmentSeat[]> => {
  return (await axios.get(`/api/treatmentSites/${id}/treatmentSeats`)).data;
};

export const getTreatmentsInTreatmentSite = async (
  id: number
): Promise<Treatment[]> => {
  return (await axios.get(`/api/treatmentSites/${id}/treatments`)).data;
};
