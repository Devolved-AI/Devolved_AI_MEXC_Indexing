module.exports = {
    apps: [
      {
        name: 'argochain-scanner-backend-fetchdata',
        script: 'fetchChainData.js',
        node_args: '--max-old-space-size=2048',
        watch: false,
        autorestart: true,
        restart_delay: 5000,
        min_uptime: 10000,
        exec_mode: 'cluster',
        instances: 1,
        error_file: './logs/argochain-scanner-backend-fetchdata-error.log',
        out_file: './logs/argochain-scanner-backend-fetchdata-out.log',
        combine_logs: true,
        env: {
          NODE_ENV: 'development',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          DATABASE_URL: process.env.DATABASE_URL,
          ARGOCHAIN_RPC_URL_1: process.env.ARGOCHAIN_RPC_URL_1,
          ARGOCHAIN_RPC_URL_2: process.env.ARGOCHAIN_RPC_URL_2,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        },
        env_production: {
          NODE_ENV: 'production',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          DATABASE_URL: process.env.DATABASE_URL,
          ARGOCHAIN_RPC_URL_1: process.env.ARGOCHAIN_RPC_URL_1,
          ARGOCHAIN_RPC_URL_2: process.env.ARGOCHAIN_RPC_URL_2,
          ARGOCHAIN_RPC_URL: process.env.ARGOCHAIN_RPC_URL,
          FETCHING_BATCH_SIZE: process.env.FETCHING_BATCH_SIZE,
        }
      }
    ]
  };
  