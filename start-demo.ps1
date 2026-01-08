#!/usr/bin/env pwsh
# Convenience script to start the application in demo mode (read-only)

Write-Host "Starting Team Topologies Visualizer in DEMO MODE..." -ForegroundColor Cyan
Write-Host "Changes will not be saved to disk." -ForegroundColor Yellow
Write-Host ""

$env:READ_ONLY_MODE = "true"

& "$PSScriptRoot\venv\Scripts\python.exe" -m uvicorn main:app --reload
