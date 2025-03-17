import { IsNumber } from 'class-validator';

export class AddMovieDto {
  @IsNumber()
  movieId: string;
}
