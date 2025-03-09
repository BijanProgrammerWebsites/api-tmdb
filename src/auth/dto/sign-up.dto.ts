import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(32)
  password: string;
}
