#!/bin/bash
# ============================================================
# JobListingWeb - Run Full Application
# ============================================================
# This script runs both the API and frontend together
# Prerequisites: .NET 8 SDK, Node.js 20+
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Default ports
API_HTTP_PORT=${API_HTTP_PORT:-5070}
API_HTTPS_PORT=${API_HTTPS_PORT:-7082}
CLIENT_PORT=${CLIENT_PORT:-3000}

echo "============================================================"
echo "  JobListingWeb - Starting Full Application"
echo "============================================================"
echo "  API HTTP:      http://localhost:$API_HTTP_PORT"
echo "  API HTTPS:     https://localhost:$API_HTTPS_PORT"
echo "  Frontend:      http://localhost:$CLIENT_PORT"
echo "  Swagger:       https://localhost:$API_HTTPS_PORT/swagger"
echo "============================================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null || true
    fi
    echo "All services stopped."
}

trap cleanup EXIT INT TERM

# Start API
echo ""
echo "Starting API..."
cd "$PROJECT_ROOT/JobListingWebAPI"
dotnet run --urls "http://localhost:$API_HTTP_PORT;https://localhost:$API_HTTPS_PORT" &
API_PID=$!
echo "API started (PID: $API_PID)"

# Wait for API to be ready
echo "Waiting for API to be ready..."
for i in {1..30}; do
    if curl -sf "http://localhost:$API_HTTP_PORT/health" > /dev/null 2>&1; then
        echo "API is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "API failed to start. Check logs above."
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo ""
echo "Starting Frontend..."
cd "$PROJECT_ROOT/JobListingWebClient"
PORT=$CLIENT_PORT npm start &
CLIENT_PID=$!
echo "Frontend started (PID: $CLIENT_PID)"

echo ""
echo "============================================================"
echo -e "${GREEN}All services are running!${NC}"
echo "============================================================"
echo "  Press Ctrl+C to stop all services"
echo "============================================================"

# Wait for both processes
wait $API_PID $CLIENT_PID
