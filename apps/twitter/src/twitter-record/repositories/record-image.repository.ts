import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { In, Repository } from 'typeorm';
import * as uuid from 'uuid';

import { FileService } from 'common/file';

import { TwitterRecordImage } from '../entities/twitter-record-image.entity';

@Injectable()
export class RecordImageRepository {
  constructor(
    @InjectRepository(TwitterRecordImage) private readonly typeormRepository: Repository<TwitterRecordImage>,
    private readonly fileService: FileService,
  ) {}

  public async defineRecordImagePathsIfNotDefined(images: TwitterRecordImage[], destination: string) {
    for (let index = 0; index < images.length; index++) {
      const currentFile = images[index];

      if (currentFile.path) {
        continue;
      }

      const currentFilename = currentFile.name;

      const newFilename = uuid.v4() + path.extname(currentFilename);

      const url = destination + newFilename;

      images[index].path = url;

      await this.fileService.renameFile(currentFilename, newFilename);
    }
  }

  private async deleteRecordImagesFromDisk(images: TwitterRecordImage[]): Promise<void> {
    const paths = images.map((image) => image.path);

    const filenames = await this.fileService.extractFilenamesWithExtensionsFormPaths(paths);

    await this.fileService.deleteFilesFromDiskStorage(filenames);
  }

  public async deleteRecordImages(images: TwitterRecordImage[]): Promise<void> {
    const ids = images.map((image) => image.id);

    await this.typeormRepository.delete({ id: In(ids) });
    await this.deleteRecordImagesFromDisk(images);
  }

  public async findImagesByIds(ids: string[]): Promise<TwitterRecordImage[]> {
    if (!ids) {
      return [];
    }

    return this.typeormRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
