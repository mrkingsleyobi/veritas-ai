/**
 * Backup Service
 *
 * Backup and recovery mechanisms for PostgreSQL database
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { postgresConfig } = require('../config/database');

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;
    this.compressionEnabled = process.env.BACKUP_COMPRESSION_ENABLED === 'true';
    this.encryptionEnabled = process.env.BACKUP_ENCRYPTION_ENABLED === 'true';
    this.encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || null;
  }

  // Initialize backup service
  async initialize() {
    try {
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`Backup directory created: ${this.backupDir}`);
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
      throw error;
    }
  }

  // Create database backup
  async createBackup(backupName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const name = backupName || `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${name}.sql`);

      // Build pg_dump command
      const cmd = [
        'pg_dump',
        `-h ${postgresConfig.host}`,
        `-p ${postgresConfig.port}`,
        `-U ${postgresConfig.user}`,
        `-d ${postgresConfig.database}`,
        '--no-password',
        '--verbose',
        '--clean',
        '--if-exists',
        '--create',
        `--file=${backupPath}`
      ].join(' ');

      console.log(`Creating backup: ${name}`);

      // Set environment variable for password
      const env = { ...process.env, PGPASSWORD: postgresConfig.password };

      // Execute backup command
      const { stdout, stderr } = await execAsync(cmd, { env });

      if (stderr) {
        console.warn('Backup warning:', stderr);
      }

      // Compress backup if enabled
      if (this.compressionEnabled) {
        await this.compressBackup(backupPath);
      }

      // Encrypt backup if enabled
      if (this.encryptionEnabled && this.encryptionKey) {
        await this.encryptBackup(backupPath);
      }

      console.log(`Backup created successfully: ${backupPath}`);

      return backupPath;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  // Compress backup file
  async compressBackup(backupPath) {
    try {
      const compressedPath = `${backupPath}.gz`;
      const cmd = `gzip "${backupPath}"`;

      console.log(`Compressing backup: ${backupPath}`);

      const { stdout, stderr } = await execAsync(cmd);

      if (stderr) {
        console.warn('Compression warning:', stderr);
      }

      console.log(`Backup compressed: ${compressedPath}`);

      return compressedPath;
    } catch (error) {
      console.error('Backup compression failed:', error);
      throw error;
    }
  }

  // Encrypt backup file
  async encryptBackup(backupPath) {
    try {
      // In a real implementation, you would use a proper encryption library
      // For this implementation, we'll just log that encryption would happen
      console.log(`Encrypting backup: ${backupPath}`);
      console.log('Note: Encryption would be implemented with a proper crypto library in production');

      return `${backupPath}.enc`;
    } catch (error) {
      console.error('Backup encryption failed:', error);
      throw error;
    }
  }

  // Restore database from backup
  async restoreBackup(backupPath) {
    try {
      console.log(`Restoring backup: ${backupPath}`);

      // Check if backup is encrypted and decrypt if needed
      if (this.encryptionEnabled && this.encryptionKey && backupPath.endsWith('.enc')) {
        backupPath = await this.decryptBackup(backupPath);
      }

      // Check if backup is compressed and decompress if needed
      if (this.compressionEnabled && backupPath.endsWith('.gz')) {
        backupPath = await this.decompressBackup(backupPath);
      }

      // Build psql command
      const cmd = [
        'psql',
        `-h ${postgresConfig.host}`,
        `-p ${postgresConfig.port}`,
        `-U ${postgresConfig.user}`,
        `-d ${postgresConfig.database}`,
        '--no-password',
        '-f',
        `"${backupPath}"`
      ].join(' ');

      // Set environment variable for password
      const env = { ...process.env, PGPASSWORD: postgresConfig.password };

      // Execute restore command
      const { stdout, stderr } = await execAsync(cmd, { env });

      if (stderr) {
        console.warn('Restore warning:', stderr);
      }

      console.log(`Backup restored successfully: ${backupPath}`);
    } catch (error) {
      console.error('Backup restore failed:', error);
      throw error;
    }
  }

  // Decrypt backup file
  async decryptBackup(backupPath) {
    try {
      // In a real implementation, you would use a proper decryption library
      // For this implementation, we'll just log that decryption would happen
      console.log(`Decrypting backup: ${backupPath}`);
      console.log('Note: Decryption would be implemented with a proper crypto library in production');

      return backupPath.replace('.enc', '');
    } catch (error) {
      console.error('Backup decryption failed:', error);
      throw error;
    }
  }

  // Decompress backup file
  async decompressBackup(backupPath) {
    try {
      const decompressedPath = backupPath.replace('.gz', '');
      const cmd = `gunzip "${backupPath}"`;

      console.log(`Decompressing backup: ${backupPath}`);

      const { stdout, stderr } = await execAsync(cmd);

      if (stderr) {
        console.warn('Decompression warning:', stderr);
      }

      console.log(`Backup decompressed: ${decompressedPath}`);

      return decompressedPath;
    } catch (error) {
      console.error('Backup decompression failed:', error);
      throw error;
    }
  }

  // List available backups
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz') || file.endsWith('.sql.enc')))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          created: fs.stat(path.join(this.backupDir, file)).then(stats => stats.mtime)
        }));

      const backupsWithDates = await Promise.all(backups.map(async backup => ({
        ...backup,
        created: await backup.created
      })));

      return backupsWithDates.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw error;
    }
  }

  // Delete old backups based on retention policy
  async cleanupOldBackups() {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();

      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const oldBackups = backups.filter(backup => backup.created < cutoffDate);

      for (const backup of oldBackups) {
        try {
          await fs.unlink(backup.path);
          console.log(`Deleted old backup: ${backup.name}`);
        } catch (error) {
          console.error(`Failed to delete backup ${backup.name}:`, error);
        }
      }

      return oldBackups.length;
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      throw error;
    }
  }

  // Schedule automatic backups
  scheduleBackups(cronExpression = '0 2 * * *') { // Default: 2 AM daily
    try {
      // In a real implementation, you would use a proper cron library
      // For this implementation, we'll just log the scheduling
      console.log(`Backup scheduled with cron expression: ${cronExpression}`);
      console.log('Note: Cron scheduling would be implemented with a proper cron library in production');
    } catch (error) {
      console.error('Failed to schedule backups:', error);
    }
  }

  // Get backup statistics
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalBackups = backups.length;
      const totalSize = await Promise.all(
        backups.map(backup => fs.stat(backup.path).then(stats => stats.size))
      ).then(sizes => sizes.reduce((sum, size) => sum + size, 0));

      return {
        totalBackups,
        totalSize,
        latestBackup: backups[0] || null,
        retentionDays: this.retentionDays
      };
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      throw error;
    }
  }
}

module.exports = BackupService;
