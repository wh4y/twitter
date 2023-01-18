import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();
const configService = new ConfigService();

export default new DataSource({
  type: configService.get<string>('DB_DIALECT'),
  host: 'localhost',
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: ['./src/**/*.entity{.ts,.js}'],
  migrations: ['./typeorm/migrations/*{.ts,.js}'],
} as DataSourceOptions);
