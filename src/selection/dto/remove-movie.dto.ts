import { IsNumber } from 'class-validator';

export class RemoveMovieDto {
  @IsNumber()
  movieId: string;
}
