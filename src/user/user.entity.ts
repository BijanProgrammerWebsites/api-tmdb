import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Exclude } from 'class-transformer';

import { Selection } from '../selection/selection.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  username: string;

  @Column('text', { unique: true, nullable: true, default: null })
  email: string | null;

  @Column('text')
  @Exclude()
  password: string;

  @Column('text', { nullable: true, default: null })
  firstName: string | null;

  @Column('text', { nullable: true, default: null })
  lastName: string | null;

  @Column('date', { nullable: true, default: null })
  dob: Date | null;

  @OneToMany(() => Selection, (selection) => selection.user)
  selections: Selection[];

  @Column('text', { nullable: true, default: null })
  @Exclude()
  refreshToken: string | null;
}
