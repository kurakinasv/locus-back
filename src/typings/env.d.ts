declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    DB_PORT: string;
    JWT_SECRET: string;
    AUTH_COOKIE_NAME: string;
    GROUP_COOKIE_NAME: string;
  }
}
