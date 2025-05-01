# Stop on error
$ErrorActionPreference = "Stop"

# Function to log messages
function Write-Log {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Type] $Message"
}

# Function to check if a service is healthy
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [int]$MaxRetries = 10,
        [int]$RetryInterval = 5
    )
    
    $retries = 0
    while ($retries -lt $MaxRetries) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method Get
            if ($response.status -eq "ok") {
                Write-Log "Service $ServiceName is healthy"
                return $true
            }
        } catch {
            Write-Log "Service $ServiceName is not ready yet (attempt $($retries + 1)/$MaxRetries)" -Type "WARN"
            Start-Sleep -Seconds $RetryInterval
            $retries++
        }
    }
    Write-Log "Service $ServiceName failed to become healthy after $MaxRetries attempts" -Type "ERROR"
    return $false
}

# Main script
try {
    Write-Log "Starting test environment setup..."

    # Stop any running containers
    Write-Log "Stopping any running containers..."
    docker-compose down

    # Start the services
    Write-Log "Starting services..."
    docker-compose up -d

    # Wait for services to be healthy
    Write-Log "Waiting for services to be healthy..."
    if (-not (Test-ServiceHealth -ServiceName "notification-service")) {
        throw "Notification service failed to become healthy"
    }

    # Change to tests directory
    Push-Location -Path "tests"

    # Install test dependencies
    Write-Log "Installing test dependencies..."
    npm install

    # Run the tests
    Write-Log "Running tests..."
    npm test

    # Change back to original directory
    Pop-Location

    # Clean up
    Write-Log "Cleaning up..."
    docker-compose down

    Write-Log "Test execution completed successfully" -Type "SUCCESS"
} catch {
    Write-Log "Error: $_" -Type "ERROR"
    Write-Log "Cleaning up after error..."
    docker-compose down
    exit 1
} 