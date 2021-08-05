import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TreatmentItem } from "./TreatmentItem";
import { TreatmentSchedule } from "./TreatmentSchedule";
import { TreatmentSite } from "./TreatmentSite";

@Entity()
export class TreatmentSeat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TreatmentSite,
    (treatmentSite) => treatmentSite.treatmentSeats,
    {
      onDelete: "CASCADE",
    }
  )
  treatmentSite: TreatmentSite;

  @ManyToMany(() => TreatmentItem, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  treatmentItems?: TreatmentItem[];

  @OneToOne(() => TreatmentSchedule, { nullable: true })
  @JoinColumn()
  currentTreatmentSchedule?: TreatmentSchedule;

  @Column()
  buttonId: string;
}
