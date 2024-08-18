#!/bin/bash

LOG_FILE="./logs/mexc_indexing_frontend-error.log"
ERROR_KEYWORDS=(
    "Invariant: Missing 'next-action' header" 
    "Failed to find Server Action" 
    "node:async_hooks"
    "RPC methods not decorated"
)

while true; do
    for keyword in "${ERROR_KEYWORDS[@]}"; do
        if grep -q "$keyword" "$LOG_FILE"; then
            echo "Error detected: $keyword"
            echo "Executing recovery steps..."
            pm2 restart mexc_indexing_frontend
            # Clear the log file to prevent repeated restarts on the same error
            : > "$LOG_FILE"
        fi
    done
    sleep 30  # Check every 20 seconds
done