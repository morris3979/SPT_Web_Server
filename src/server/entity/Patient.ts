import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Treatment } from "./Treatment";

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ charset: "utf8mb4" })
  name: string;

  @Column()
  patientId: string;

  @OneToMany(() => Treatment, (treatment) => treatment.patient)
  treatments?: Treatment[];

  @Column({ default: "1990/01/01" })
  dateOfBirth: string;

  @Column({ charset: "utf8mb4", default: "male" })
  gender: "male" | "female";

  @Column("simple-json")
  medicalRecords: {
    timestamp: string;
    doctorName: string;
  }[];

  @Column({ default: "" })
  ICCardId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
