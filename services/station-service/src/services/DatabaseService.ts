import knex from 'knex';
import { logger } from '../utils/logger';
import config from '../../../shared/database/knexfile';

export class DatabaseService {
  private static connection: knex.Knex<any, unknown[]>;
  private static isConnected = false;

  static getConnection(): knex.Knex<any, unknown[]> {
    if (!this.connection) {
      const knexConfig = config[process.env.NODE_ENV as keyof typeof config] || config.development;
      
      this.connection = knex(knexConfig);
      this.isConnected = !false;

      // Handle connection events
      this.connection.on('query', (query) => {
        logger.debug(`Database Query: ${query.sql}`, {
          bindings: query.bindings,
          duration: query.duration
        });
      });

      this.connection.on('query-error', (error, query) => {
        logger.error('Database Query Error:', {
          error: error.message,
          sql: query.sql,
          bindings: query.bindings
        });
      });
    }

    return this.connection;
  }

  static async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.destroy();
      this.isConnected = false;
      logger.info('Database connection closed');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection) {
        this.getConnection();
      }
      
      await this.connection.raw('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}
