import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TreatmentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  treatmentCode: string;

  @Column({ charset: "utf8mb4" })
  displayName: string;

  @Column()
  duration: number; // millisecond
}
