#!/bin/bash

LOG_FILE="./logs/mexc_indexing_frontend-error.log"
PROCESS_NAME="mexc_indexing_frontend"
FREEZE_CHECK_INTERVAL=3  # seconds

# Function to check if the process is running
is_process_running() {
    pm2 describe "$PROCESS_NAME" > /dev/null
    return $?
}

# Function to check if the process is frozen by monitoring its logs
is_process_frozen() {
    ERROR_KEYWORDS=("Invariant: Missing 'next-action' header" "Failed to find Server Action" "node:async_hooks")
    
    for keyword in "${ERROR_KEYWORDS[@]}"; do
        if grep -q "$keyword" "$LOG_FILE"; then
            return 0
        fi
    done
    return 1
}

# Function to restart the process
restart_process() {
    echo "Process frozen or not responding. Restarting..."
    pm2 restart "$PROCESS_NAME"
    
    # Clear the log file to prevent repeated restarts on the same error
    : > "$LOG_FILE"
}

# Main loop
while true; do
    if is_process_running; then
        if is_process_frozen; then
            restart_process
        fi
    else
        echo "Process $PROCESS_NAME is not running. Starting it..."
        pm2 start "$PROCESS_NAME"
    fi

    sleep $FREEZE_CHECK_INTERVAL  # Check every 30 seconds
done