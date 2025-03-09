import { User } from '../../entities/user.entity';

export type SignInDto = Pick<User, 'username' | 'password'>;
