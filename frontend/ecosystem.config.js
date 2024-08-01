module.exports = {
  apps: [
    {
      name: "mexc_indexing_frontend",
      script: "npm",
      args: "start",
      autorestart: true,
      time: true,
      restart_delay: 3000,
      watch: true,
      ignore_watch: [
        "node_modules",
        "logs"
      ],
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: './logs/mexc_indexing_frontend-error.log',
      out_file: './logs/mexc_indexing_frontend-out.log',
      combine_logs: true,
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000,
      }
    }
  ]
};
