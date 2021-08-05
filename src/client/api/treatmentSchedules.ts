import { TreatmentSchedule } from "../types";
import Axios from "axios";

export const getOnSeatTreatmentSchedules = async (): Promise<
  TreatmentSchedule[]
> => {
  return (await Axios.get("/api/treatmentSchedules?status=onSeat")).data;
};

export const changeTreatmentScheduleStatus = async (
  id: number,
  changeValue: {
    status: "inQueue" | "onSeat" | "treating" | "pause" | "stop" | "end";
    stopTime: number;
  }
) => {
  await Axios.patch(`/api/treatmentSchedules/${id}/status`, changeValue);
};

export const changeTreatmentScheduleSkip = async (
  id: number,
  changeValue: { skip: boolean }
) => {
  await Axios.patch(`/api/treatmentSchedules/${id}/skip`, changeValue);
};
