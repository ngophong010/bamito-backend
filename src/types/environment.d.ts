declare namespace NodeJS {
  export interface ProcessEnv {
    // --- SERVER ---
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;

    // --- DATABASE (POSTGRESQL) ---
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD?: string; // Password can be optional for some local setups
    DB_DATABASE: string;
    DB_DIALECT: string; // While we use postgres, this could be here

    // --- JWT SECRETS ---
    ACCESS_KEY: string;
    REFRESH_KEY: string;
    ACCESS_TIME: string;
    REFRESH_TIME: string;

    // --- CLIENT URLS (for CORS) ---
    URL_CLIENT: string;
    URL_CLIENT_MANAGEMENT: string;
    URL_SERVER: string;

    // --- EXTERNAL SERVICES ---
    EMAIL_APP: string;
    EMAIL_APP_PASSWORD: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    VNP_TMNCODE: string;
    VNP_HASHSECRET: string;
    VNP_URL: string;
    VNP_RETURNURL: string;
  }
}