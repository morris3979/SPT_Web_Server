import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TreatmentSchedule } from "./TreatmentSchedule";
import { TreatmentSeat } from "./TreatmentSeat";

@Entity()
export class TreatmentSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ charset: "utf8mb4" })
  name: string;

  @OneToMany(
    () => TreatmentSeat,
    (treatmentSeat) => treatmentSeat.treatmentSite
  )
  treatmentSeats?: TreatmentSeat[];

  @OneToMany(
    () => TreatmentSchedule,
    (treatmentSchedule) => treatmentSchedule.treatmentSite
  )
  treatmentSchedules?: TreatmentSchedule[];
}
