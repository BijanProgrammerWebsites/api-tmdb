import { IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
