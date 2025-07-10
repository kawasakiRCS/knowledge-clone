#!/bin/bash

# Log chat interactions to timestamped files
LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/chat-$(date '+%Y%m%d').log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Get the current timestamp
TIMESTAMP="[$(date '+%Y-%m-%d %H:%M:%S')]"

# Log based on the event type
case "$1" in
  "tool")
    echo "$TIMESTAMP Tool: $TOOL_NAME" >> "$LOG_FILE"
    if [ -n "$TOOL_INPUT" ]; then
      echo "$TOOL_INPUT" | jq -r '.' >> "$LOG_FILE" 2>/dev/null || echo "$TOOL_INPUT" >> "$LOG_FILE"
    fi
    ;;
  "result")
    echo "$TIMESTAMP Result: $TOOL_NAME" >> "$LOG_FILE"
    if [ -n "$TOOL_OUTPUT" ]; then
      # Truncate very long outputs
      echo "$TOOL_OUTPUT" | head -c 1000 >> "$LOG_FILE"
      if [ ${#TOOL_OUTPUT} -gt 1000 ]; then
        echo "... (truncated)" >> "$LOG_FILE"
      fi
    fi
    ;;
  "stop")
    echo -e "\n$TIMESTAMP === Session End ===\n" >> "$LOG_FILE"
    ;;
  *)
    echo "$TIMESTAMP $1" >> "$LOG_FILE"
    ;;
esac