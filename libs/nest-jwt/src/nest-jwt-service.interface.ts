import { JwtService } from '@nestjs/jwt';

export interface NestJwtService extends JwtService {
  decode<P>(token: string): P;
}
