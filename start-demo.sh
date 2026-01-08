#!/bin/bash
# Convenience script to start the application in demo mode (read-only)

echo -e "\033[36mStarting Team Topologies Visualizer in DEMO MODE...\033[0m"
echo -e "\033[33mChanges will not be saved to disk.\033[0m"
echo ""

export READ_ONLY_MODE=true

python -m uvicorn main:app --reload
