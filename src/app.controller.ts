import { All, Controller, Param, Query } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All()
  async proxy(
    @Param('path') path: string[],
    @Query() query: Record<string, string>,
  ): Promise<any> {
    const endpoint = path.join('/');
    const searchParams = new URLSearchParams(query).toString();

    return this.appService.proxy(endpoint, searchParams);
  }
}
