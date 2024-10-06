#!/bin/bash

# File that contains the last processed block number
BLOCK_FILE="./backend/lastProcessedBlock.txt"
PM2_SERVICES=("argochain-scanner-backend-fetchdata" "argochain-scanner-api" "argochain-scanner-frontend")  # Add multiple PM2 service names here
CHECK_INTERVAL=10  # Check every 10 seconds

# Function to restart PM2 services
restart_pm2_services() {
    echo "Block number is not increasing. Restarting PM2 services..."
    
    for service in "${PM2_SERVICES[@]}"; do
        pm2 restart "$service"
        echo "Restarted PM2 service: $service"
    done

    echo "PM2 services restarted."
}

# Function to monitor if the block number is increasing
monitor_block_number() {
    while true; do
        if [[ -f "$BLOCK_FILE" ]]; then
            # Read the initial block number
            initial_block_number=$(cat "$BLOCK_FILE")

            # Wait for the specified interval
            sleep $CHECK_INTERVAL

            # Read the block number again after the interval
            new_block_number=$(cat "$BLOCK_FILE")

            # Check if the block number has increased
            if [[ "$new_block_number" -le "$initial_block_number" ]]; then
                # Restart PM2 services if the block number hasn't increased
                echo "No change detected in block number. Initial: $initial_block_number, Current: $new_block_number"
                restart_pm2_services
            else
                echo "Block number is increasing: $new_block_number"
            fi
        else
            echo "Block file $BLOCK_FILE not found. Monitoring paused."
        fi
    done
}

# Start monitoring the block number
monitor_block_number
