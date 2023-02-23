import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';

import { Message } from '../../entities/message.entity';

import { MessageFiltrationOptions } from './message-repository.options';

@Injectable()
export class MessageRepository {
  constructor(@InjectRepository(Message) private readonly typeormRepository: Repository<Message>) {}

  public async save(message: Message): Promise<void> {
    await this.typeormRepository.save(message);
  }

  public async findManyByChatId(
    chatId: string,
    paginationOptions: PaginationOptions,
    filtrationOptions: MessageFiltrationOptions,
  ): Promise<Paginated<Message>> {
    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    const queryBuilder = await this.typeormRepository.createQueryBuilder('m');

    queryBuilder.where('m.chatId = :chatId', { chatId });

    if (filtrationOptions.createdLaterThan) {
      queryBuilder.andWhere('m.createdAt > :than', { than: filtrationOptions.createdLaterThan });
    }

    queryBuilder.orderBy('m.createdAt', 'DESC');

    queryBuilder.skip(skip).take(take);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return { data: messages, page: paginationOptions.page || 1, total, take: take || total };
  }
}
