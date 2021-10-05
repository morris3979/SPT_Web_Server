import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";

  @Entity()
  export class Register {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ charset: "utf8mb4" })
    name: string;

    @Column()
    userId: string;

    @Column()
    password: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
  }