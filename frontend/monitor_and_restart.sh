#!/bin/bash

LOG_FILE="./logs/mexc_indexing_frontend-error.log"

while true; do
    # Check if the log file is not empty
    if [ -s "$LOG_FILE" ]; then
        echo "Error detected in log file."
        echo "Executing recovery steps..."
        npm run build
        pm2 restart mexc_indexing_frontend
        echo -n > /logs/mexc_indexing_frontend-error.log

        # Clear the log file to prevent repeated restarts on the same error
        : > "$LOG_FILE"
    fi
    sleep 30  # Check every 30 seconds
done