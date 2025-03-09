import { User } from '../../entities/user.entity';

export type RefreshDto = Pick<User, 'id'>;
