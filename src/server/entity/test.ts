import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";

  @Entity()
  export class test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ charset: "utf8mb4" })
    name: string;

    @Column()
    schoolID: string;

    @Column()
    password: string;

    @Column({ default: "1990/01/01" })
    dateOfBirth: string;

    @Column({ charset: "utf8mb4", default: "male" })
    gender: "male" | "female";


    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
  }
