import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { nestJwtServiceProvider } from 'common/nest-jwt/nest-jwt-service.provider';

@Module({
  imports: [JwtModule],
  providers: [nestJwtServiceProvider],
  exports: [nestJwtServiceProvider, JwtModule],
})
export class NestJwtModule {}
