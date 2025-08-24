declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DB_DIALECT: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    URL_CLIENT: string;
    URL_CLIENT_MANAGEMENT: string;
  }
}