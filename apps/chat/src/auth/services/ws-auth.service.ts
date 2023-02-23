import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';

import { Session } from '../entities/session.entity';
import { extractSessionIdFromCookies } from '../utils/extract-session-id-from-cookies.util';

import { SessionService } from './session.service';

@Injectable()
export class WsAuthService {
  constructor(private readonly sessionService: SessionService) {}

  public async authenticateSession(handshake: IncomingMessage): Promise<Session> {
    const sessionId = extractSessionIdFromCookies(handshake.headers.cookie);

    return this.sessionService.getSessionById(sessionId);
  }
}
