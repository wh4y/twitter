import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class UserFollowingsService {
  private readonly axiosHttpInstance: AxiosInstance;

  constructor() {
    this.axiosHttpInstance = axios.create({
      baseURL: 'http://localhost:5000/user-followings',
      withCredentials: true,
    });
  }

  public async areBothUsersFollowersOfEachOther(firstUserId: string, secondUserId: string): Promise<boolean> {
    const { data } = await this.axiosHttpInstance.get<{ result: boolean }>(
      `/check?firstUserId=${firstUserId}&secondUserId=${secondUserId}`,
    );

    return data.result;
  }
}
