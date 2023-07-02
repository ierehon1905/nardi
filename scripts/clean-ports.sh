#!/bin/bash

echo "Cleaning ports 3000 and 8080"

# Find the processes running on ports 3000 and 8080
processes=$(lsof -i :3000 -i :8080 -t)

# Terminate the processes
if [ -n "$processes" ]; then
  echo "Killing processes: $processes"
  kill $processes
else
  echo "No processes found on ports 3000 and 8080"
fi
