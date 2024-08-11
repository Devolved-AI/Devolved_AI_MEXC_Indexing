module.exports = {
    apps: [
      {
        name: 'mexc-indexing-api',
        script: "node",
        args: "src/server.js",
        instances: 1,
        autorestart: true,
        time: true,
        restart_delay: 3000,
        watch: true,
        ignore_watch : ["node_modules", "logs"],
        max_memory_restart: "1G",
        log_date_format: "YYYY-MM-DD HH:mm Z",
        error_file: './logs/fetchChainData-error.log',
        out_file: './logs/fetchChainData-out.log',
        combine_logs: true,
        env: {
          NODE_ENV: 'development',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          DATABASE_URL: process.env.DATABASE_URL,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        },
        env_production: {
          NODE_ENV: 'production',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          DATABASE_URL: process.env.DATABASE_URL,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        }
      }
    ]
};
  