#!/bin/bash

LOG_FILE="./logs/mexc_indexing_frontend-error.log"
PROCESS_NAME="mexc_indexing_frontend"
FREEZE_CHECK_INTERVAL=3  # seconds
LOG_UPDATE_THRESHOLD=5  # seconds (5 minutes)

# Function to check if the process is running
is_process_running() {
    pm2 describe "$PROCESS_NAME" > /dev/null
    return $?
}

# Function to check if the log file has been updated recently
is_log_file_stale() {
    if [ ! -f "$LOG_FILE" ]; then
        return 1
    fi

    last_mod_time=$(stat -c %Y "$LOG_FILE")
    current_time=$(date +%s)
    time_diff=$((current_time - last_mod_time))

    if [ $time_diff -gt $LOG_UPDATE_THRESHOLD ]; then
        return 0  # Log file is stale
    else
        return 1  # Log file is being updated
    fi
}

# Function to restart the process
restart_process() {
    echo "Process seems to be frozen or not responding. Restarting..."
    pm2 restart "$PROCESS_NAME"

    # Clear the log file to prevent repeated restarts on the same error
    : > "$LOG_FILE"
}

# Main loop
while true; do
    if is_process_running; then
        if is_log_file_stale; then
            restart_process
        fi
    else
        echo "Process $PROCESS_NAME is not running. Starting it..."
        pm2 start "$PROCESS_NAME"
    fi

    sleep $FREEZE_CHECK_INTERVAL  # Check every 30 seconds
done
