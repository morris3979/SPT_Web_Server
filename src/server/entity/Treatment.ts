import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Patient } from "./Patient";
import { TreatmentSchedule } from "./TreatmentSchedule";

@Entity()
export class Treatment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.treatments, {
    onDelete: "CASCADE",
  })
  patient: Patient;

  @Column()
  section: "morning" | "afternoon" | "night";

  @OneToMany(
    () => TreatmentSchedule,
    (treatmentSchedule) => treatmentSchedule.treatment
  )
  treatmentSchedules?: TreatmentSchedule[];

  @Column({ default: false })
  stoppingStatus: boolean;

  @Column({ nullable: true })
  treatmentPosition: string;

  @Column({ nullable: true })
  detail: string;

  @Column({ default: "[]" })
  bind: string;

  @Column({ default: "[]" })
  sort: string;

  @Column({ default: "[]" })
  follow: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
