import axios from "axios";
import { TreatmentItem } from "../types";

export const getTreatmentItems = async (): Promise<TreatmentItem[]> => {
  return (await axios.get("/api/treatmentItems")).data;
};

export const createTreatmentItem = async (
  displayName: string,
  treatmentCode: string,
  duration: number
): Promise<void> => {
  await axios.post("/api/treatmentItems", {
    displayName,
    treatmentCode,
    duration,
  });
};

export const changeTreatmentItem = async (
  id: number,
  displayName?: string,
  treatmentCode?: string,
  duration?: number
): Promise<void> => {
  await axios.patch(`/api/treatmentItems/${id}`, {
    displayName,
    treatmentCode,
    duration,
  });
};

export const deleteTreatmentItem = async (id: number): Promise<void> => {
  await axios.delete(`/api/treatmentItems/${id}`);
};
