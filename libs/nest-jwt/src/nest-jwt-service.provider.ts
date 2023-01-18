import { Provider } from '@nestjs/common';

import { NEST_JWT_SERVICE } from 'common/nest-jwt/nest-jwt-service.inject-token';
import { NestJwtService } from 'common/nest-jwt/nest-jwt.service';

export const nestJwtServiceProvider: Provider = {
  provide: NEST_JWT_SERVICE,
  useClass: NestJwtService,
};
