import { Injectable } from '@nestjs/common';

import { Session } from '../../entities/session.entity';
import { SessionRepository } from '../../repositories/session.repository';

import { StartNewSessionOptions } from './session-service.options';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  public async startNewUserSession(options: StartNewSessionOptions): Promise<Session> {
    const hasNumberOfActiveUserSessionsExceeded = await this.hasNumberOfActiveUserSessionsExceeded(options.userId);

    if (hasNumberOfActiveUserSessionsExceeded) {
      await this.sessionRepository.deleteOldestSessionByUserId(options.userId);
    }

    const session = new Session({ ...options });

    await this.sessionRepository.save(session);

    return session;
  }

  public async cancelAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
  }

  public async cancelSession(id: string): Promise<Session> {
    const session = await this.sessionRepository.findByIdOrThrow(id);

    await this.sessionRepository.deleteById(id);

    return session;
  }

  public async getActiveUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.findManyByUserId(userId);
  }

  public async hasNumberOfActiveUserSessionsExceeded(userId: string): Promise<boolean> {
    const userSessionCount = await this.sessionRepository.getTotalUserSessionsCount(userId);

    return userSessionCount === 10;
  }
}
