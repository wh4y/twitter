import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';

import { Message } from '../entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(@InjectRepository(Message) private readonly typeormRepository: Repository<Message>) {}

  public async save(message: Message): Promise<void> {
    await this.typeormRepository.save(message);
  }

  public async findManyByChatId(chatId: string, paginationOptions: PaginationOptions): Promise<Paginated<Message>> {
    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    const [messages, total] = await this.typeormRepository.findAndCount({
      where: {
        chatId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take,
    });

    return { data: messages, page: paginationOptions.page || 1, total, take: take || total };
  }
}
