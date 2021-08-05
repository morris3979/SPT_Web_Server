import axios from "axios";

export const creatTreatmentSeat = async (
  siteId: number,
  buttonId: string,
  treatmentItemIds: number[]
): Promise<void> => {
  await axios.post("/api/treatmentSeats/", {
    siteId,
    buttonId,
    treatmentItemIds,
  });
};

export const changeTreatmentSeat = async (
  id: number,
  buttonId?: string,
  treatmentItemIds?: number[]
): Promise<void> => {
  await axios.patch(`/api/treatmentSeats/${id}`, {
    buttonId,
    treatmentItemIds,
  });
};

export const deleteTreatmentSeat = async (id: number) => {
  await axios.delete(`/api/treatmentSeats/${id}`);
};

export const changeTreatmentSeatControllerStatus = async (
  id: number,
  status: "pause" | "start" | "skip" | "reset"
) => {
  await axios.patch(`/api/treatmentSeats/${id}/controller/status`, {
    status: status,
  });
};
