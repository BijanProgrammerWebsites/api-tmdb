import { User } from '../../entities/user.entity';

export type SignOutDto = Pick<User, 'id'>;
