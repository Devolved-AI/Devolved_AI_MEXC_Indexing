module.exports = {
  apps: [
    {
      name: "argochain_scanner_frontend",
      script: "npm",
      args: "start",
      exec_mode: 'cluster',
      autorestart: true,
      restart_delay: 3000,
      watch: true,
      ignore_watch: ["node_modules", "logs", "public"],
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: './logs/argochain_scanner_frontend-error.log',
      out_file: './logs/argochain_scanner_frontend-out.log',
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
    },
  ],
};