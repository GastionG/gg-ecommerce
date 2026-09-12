import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
