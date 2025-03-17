import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
export class Selection {
  @PrimaryColumn('int')
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.selections)
  user: User;
}
