#!/usr/bin/env pwsh
# Convenience script to start the application in demo mode (read-only)

Write-Host "Starting Team Topologies Visualizer in DEMO MODE..." -ForegroundColor Cyan
Write-Host "Changes will not be saved to disk." -ForegroundColor Yellow
Write-Host ""

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $RepoRoot
try {
	# Set environment variable
	$env:READ_ONLY_MODE = "true"

	# Start uvicorn WITHOUT --reload (reload doesn't preserve env vars in child processes)
	& "$RepoRoot\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000
} finally {
	Pop-Location
}
