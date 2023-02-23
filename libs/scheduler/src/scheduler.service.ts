import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  public addTimeout(name: string, ms: number, callback: any): void {
    const timeout = setTimeout(callback, ms);

    this.schedulerRegistry.addTimeout(name, timeout);
  }

  public deleteTimeout(name: string): void {
    this.schedulerRegistry.deleteTimeout(name);
  }

  public doesTimeoutExist(name: string): boolean {
    return this.schedulerRegistry.doesExist('timeout', name);
  }
}
