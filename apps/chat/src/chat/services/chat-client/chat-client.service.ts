import { Injectable } from '@nestjs/common';

import { ChatClient } from '../../entities/chat-client.entity';
import { ChatClientRepository } from '../../repositories/chat-client/chat-client.repository';

@Injectable()
export class ChatClientService {
  constructor(private readonly chatClientRepository: ChatClientRepository) {}

  public async registerClient(client: ChatClient): Promise<void> {
    await this.chatClientRepository.add(client);
  }

  public async removeClient(client: ChatClient): Promise<void> {
    await this.chatClientRepository.deleteById(client.id);
  }

  public async getClientsByUserId(userId: string): Promise<ChatClient[]> {
    return this.chatClientRepository.findManyByUserId(userId);
  }

  public async getManyClientsByUserIds(userIds: string[]): Promise<ChatClient[]> {
    const clients: ChatClient[] = [];

    for (const userId of userIds) {
      const userClients = await this.getClientsByUserId(userId);

      clients.push(...userClients);
    }

    return clients;
  }

  public async getClientById(id: string): Promise<ChatClient> {
    return this.chatClientRepository.findById(id);
  }
}
