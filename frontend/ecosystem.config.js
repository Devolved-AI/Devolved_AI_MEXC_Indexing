module.exports = {
  apps: [
    {
      name: "argochain-scanner-frontend",
      script: "npm",
      args: "start",
      exec_mode: 'cluster',
      autorestart: true,
      restart_delay: 3000,
      watch: true,
      ignore_watch: ["node_modules", "logs", "public"],
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: './logs/argochain-scanner-frontend.log',
      out_file: './logs/argochain-scanner-frontend.log',
      combine_logs: true,
      env: {
        NODE_ENV: "development",
        RPC_NODE_URL: process.env.RPC_NODE_URL,
        PORT: process.env.PORT,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
      },
      env_production: {
        NODE_ENV: "production",
        RPC_NODE_URL: process.env.RPC_NODE_URL,
        PORT: process.env.PORT,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
      },
      env: {
        NODE_ENV: 'development',
        POSTGRES_DB: process.env.POSTGRES_DB,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        PORT: process.env.PORT
      },
      env_production: {
        NODE_ENV: 'production',
        POSTGRES_DB: process.env.POSTGRES_DB,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        PORT: process.env.PORT
      }
    },
  ],
};