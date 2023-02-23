import { Injectable } from '@nestjs/common';

import { Session } from '../entities/session.entity';
import { SessionRepository } from '../repositories/session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  public async getSessionById(id: string): Promise<Session> {
    return this.sessionRepository.findByIdOrThrow(id);
  }
}
