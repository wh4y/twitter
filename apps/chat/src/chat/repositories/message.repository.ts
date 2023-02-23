import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from '../entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(@InjectRepository(Message) private readonly typeormRepository: Repository<Message>) {}

  public async save(message: Message): Promise<void> {
    await this.typeormRepository.save(message);
  }
}
