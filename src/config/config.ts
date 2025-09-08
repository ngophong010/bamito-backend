import type { Dialect, PoolOptions } from "sequelize";

type DbConfig = {
  username: string;
  password?: string | null;
  database: string;
  host: string;
  port: number;
  // FIX 1: Use the specific 'Dialect' type instead of a generic 'string'.
  dialect: Dialect;
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
  pool?: PoolOptions; // Add the 'pool' property for production use
};

type AppConfig = {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
};

const config: AppConfig = {
  development: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE!,
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT! ? parseInt(process.env.DB_PORT!, 10) : 5432,
    dialect: "postgres",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres",
    port: 5432,
  },
  production: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE!,
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT! ? parseInt(process.env.DB_PORT!, 10) : 5432,
    dialect: "postgres",

    // ENHANCEMENT: Add dialectOptions for production-grade SSL connections
    // This is often required by cloud database providers like Heroku, Vercel, AWS RDS, etc.
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // This may be needed for some cloud providers
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
};

export default config;
