import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Treatment } from "./Treatment";
import { TreatmentItem } from "./TreatmentItem";
import { TreatmentSite } from "./TreatmentSite";

@Entity()
export class TreatmentSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Treatment, (treatment) => treatment.treatmentSchedules, {
    onDelete: "CASCADE",
  })
  treatment: Treatment;

  @ManyToMany(() => TreatmentItem, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  treatmentItems?: TreatmentItem[];

  @ManyToOne(
    () => TreatmentSite,
    (treatmentSite) => treatmentSite.treatmentSchedules,
    {
      onDelete: "CASCADE",
    }
  )
  treatmentSite: TreatmentSite;

  @Column({ default: 0 })
  postponeTime: number; // -1 is stop until start manually

  @Column({ default: 0 })
  remainTime: number; // not sure need or not

  @Column({ default: false })
  skip: boolean;

  @Column({ default: false })
  follow: boolean;

  @Column({ default: "inQueue" })
  status: "inQueue" | "onSeat" | "treating" | "pause" | "stop" | "end"; //pause is on sit and keep remind time, stop is out of sit

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  UpdatedAt!: Date;
}
