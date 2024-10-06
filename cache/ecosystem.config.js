module.exports = {
    apps: [
      {
        name: 'argochain-scanner-cache-listener',
        script: "npm",
        args: "start",
        watch: true,
        ignore_watch: [ "node_modules", "logs" ],
        autorestart: true,
        restart_delay: 5000,
        min_uptime: 10000,
        exec_mode: 'cluster',
        instances: 1,
        error_file: './logs/argochain-scanner-cache-listener-error.log',
        out_file: './logs/argochain-scanner-cache-listener-out.log',
        combine_logs: true,
        env: {
          NODE_ENV: 'development',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          POSTGRES_HOST: process.env.POSTGRES_HOST,
          POSTGRES_PORT: process.env.POSTGRES_PORT,
          REDIS_HOST: process.env.REDIS_HOST,
          REDIS_PORT: process.env.REDIS_PORT,
        },
        env_production: {
          NODE_ENV: 'production',
          POSTGRES_DB: process.env.POSTGRES_DB,
          POSTGRES_USER: process.env.POSTGRES_USER,
          POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
          POSTGRES_HOST: process.env.POSTGRES_HOST,
          POSTGRES_PORT: process.env.POSTGRES_PORT,
          REDIS_HOST: process.env.REDIS_HOST,
          REDIS_PORT: process.env.REDIS_PORT,
        },
      }
    ],
  };