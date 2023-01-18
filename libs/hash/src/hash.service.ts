import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  public async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return bcrypt.hash(data, salt);
  }

  public async compare(hashedData: string, dataToCompare: string): Promise<boolean> {
    return bcrypt.compare(dataToCompare, hashedData);
  }
}
