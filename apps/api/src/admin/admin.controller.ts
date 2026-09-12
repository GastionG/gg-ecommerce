import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  @Get('health')
  health() {
    return { ok: true };
  }
}
