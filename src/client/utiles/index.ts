import { TreatmentSeat } from "../types";

export function getDistinctiveTreatmentItemsInTreatmentSeats(
  treatmentSeats: TreatmentSeat[]
): { ids: string; displayNames: string }[] {
  const distinctiveTreatmentItems: { ids: string; displayNames: string }[] = [];
  for (const seat of treatmentSeats) {
    const ids: number[] = [];
    const displayNames: string[] = [];

    seat.treatmentItems!.sort((l, r) => l.id - r.id);

    for (const item of seat.treatmentItems!) {
      ids.push(item.id);
      displayNames.push(item.displayName);
    }
    if (
      distinctiveTreatmentItems.findIndex(
        (item) => item.ids === ids.join("&")
      ) === -1
    ) {
      distinctiveTreatmentItems.push({
        ids: ids.join("&"),
        displayNames: displayNames.join("&"),
      });
    }
  }
  return Array.from(distinctiveTreatmentItems);
}
