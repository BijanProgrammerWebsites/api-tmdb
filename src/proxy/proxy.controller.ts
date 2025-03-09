import { All, Controller, Param, Query } from '@nestjs/common';

import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*path')
  async proxy(
    @Param('path') path: string[],
    @Query() query: Record<string, string>,
  ): Promise<any> {
    const endpoint = path.join('/');
    const searchParams = new URLSearchParams(query).toString();

    return this.proxyService.proxy(endpoint, searchParams);
  }
}
