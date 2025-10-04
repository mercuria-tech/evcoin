require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ev_charging_platform',
      user: process.env.DB_USER || 'ev_user',
      password: process.env.DB_PASSWORD || 'ev_password',
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.STAGING_DB_HOST,
      port: process.env.STAGING_DB_PORT || 5432,
      database: process.env.STAGING_DB_NAME,
      user: process.env.STAGING_DB_USER,
      password: process.env.STAGING_DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT || 5432,
      database: process.env.PROD_DB_NAME,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
    },
    pool: {
      min: 5,
      max: 50,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    acquireConnectionTimeout: 60000,
    acquireRequestTimeout: 20000,
  },
};
