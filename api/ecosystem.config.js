module.exports = {
    apps: [
      {
        name: 'argochain-scanner-api',
        script: "npm",
        args: "start",
        instances: 1,
        autorestart: true,
        time: true,
        restart_delay: 3000,
        watch: true,
        ignore_watch : ["node_modules", "logs"],
        max_memory_restart: "1G",
        log_date_format: "YYYY-MM-DD HH:mm Z",
        error_file: './logs/argochain-scanner-api-error.log',
        out_file: './logs/argochain-scanner-api-out.log',
        combine_logs: true,
        env: {
          NODE_ENV: 'development',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          POSTGRES_HOST: process.env.POSTGRES_HOST,
          POSTGRES_PORT: process.env.POSTGRES_PORT,
          PORT: process.env.PORT,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          REDIS_HOST: process.env.REDIS_HOST,
          REDIS_PORT: process.env.REDIS_PORT
        },
        env_production: {
          NODE_ENV: 'production',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          POSTGRES_HOST: process.env.POSTGRES_HOST,
          POSTGRES_PORT: process.env.POSTGRES_PORT,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          PORT: process.env.PORT,
          REDIS_HOST: process.env.REDIS_HOST,
          REDIS_PORT: process.env.REDIS_PORT
        }
      }
    ]
};
  