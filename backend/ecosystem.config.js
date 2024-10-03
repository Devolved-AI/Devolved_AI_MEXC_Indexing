module.exports = {
  apps: [
    {
      name: "argochain_scanner_backend",
      script: "src/index.js",
      exec_mode: 'cluster',
      autorestart: true,
      restartDelay: 3000,
      watch: true,
      ignore_watch: ["node_modules", "logs", "src/public"],
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      node_args: "--max-old-space-size=10240",
      error_file: './logs/argochain_scanner_backend-error.log',
      out_file: './logs/argochain_scanner_backend-out.log',
      combine_logs: true,
      env: {
        NODE_ENV: "development",
        POSTGRES_DB: process.env.POSTGRES_DB,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        DATABASE_URL: process.env.DATABASE_URL,
        ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
        FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        PORT: process.env.PORT
      },
      env_production: {
        NODE_ENV: "production",
        POSTGRES_DB: process.env.POSTGRES_DB,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        DATABASE_URL: process.env.DATABASE_URL,
        ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
        FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        PORT: process.env.PORT
      },
    },
  ],
};
