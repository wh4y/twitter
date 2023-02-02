import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as nodePath from 'path';

@Injectable()
export class FileService {
  public async deleteFilesFromDiskStorage(filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      const path = `./upload/${filename}`;

      await fs.unlink(path);
    }
  }

  public async renameFile(filename, newFilename: string): Promise<void> {
    const path = './upload/';

    await fs.rename(path + filename, path + newFilename);
  }

  public async extractFilenamesWithExtensionsFormPaths(paths: string[]): Promise<string[]> {
    return paths.map((path) => {
      const filename = nodePath.parse(path).name;
      const extension = nodePath.parse(path).ext;

      return filename + extension;
    });
  }
}
