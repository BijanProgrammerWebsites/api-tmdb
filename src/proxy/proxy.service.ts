import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {
  async proxy(endpoint: string, searchParams: string): Promise<any> {
    const url = `${process.env.TMDB_BASE_URL}/3/${endpoint}?${searchParams}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    });

    return response.json();
  }
}
