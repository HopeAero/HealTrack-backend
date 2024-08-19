import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { join, dirname } from 'path';
import { existsSync, promises as fs } from 'fs';
import { ImportOptions } from '../interfaces/import-options.interface';

@Injectable()
export class DatabaseActionsService {
  private readonly backupDir = join(__dirname, '..', 'backup');
  private readonly dumpFilePath = join(this.backupDir, `healtrackdb-backup-${Date.now()}.sql`);
 
  private async ensureBackupDirExists() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (err) {
      console.error(`Error creating backup directory: ${err}`);
      throw new Error(`Error creating backup directory: ${err}`);
    }
  }

  async exportDatabase(): Promise<string> {
    await this.ensureBackupDirExists();

    const command = `pg_dump -h ${process.env.DATABASE_HOST} -p ${process.env.DATABASE_PORT} -U ${process.env.DATABASE_USERNAME} -F c -b -v -f ${this.dumpFilePath} ${process.env.DATABASE_NAME}`;

    return new Promise((resolve, reject) => {
      exec(command, { env: { PGPASSWORD: process.env.DATABASE_PASSWORD } }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error exporting database: ${stderr}`);
          reject(`Error exporting database: ${stderr}`);
        } else {
          console.log(`Database exported successfully to ${this.dumpFilePath}`);
          resolve(this.dumpFilePath);
        }
      });
    });
  }

  async importDatabase(filePath: string, options?: ImportOptions): Promise<string> {
    if (!filePath || !existsSync(filePath)) {
      throw new Error(`File at ${filePath} does not exist.`);
    }

    const command = `pg_restore --clean -h ${process.env.DATABASE_HOST} -p ${process.env.DATABASE_PORT} -U ${process.env.DATABASE_USERNAME} -d ${process.env.DATABASE_NAME} -v ${filePath}`;

    return new Promise((resolve, reject) => {
      exec(command, { env: { PGPASSWORD: process.env.DATABASE_PASSWORD } }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error importing database: ${stderr}`);
          reject(`Error importing database: ${stderr}`);
        } else {
          console.log(`Database imported successfully from ${filePath}`);
          resolve(`Database imported successfully from ${filePath}`);
        }
      });
    });
  }
}
