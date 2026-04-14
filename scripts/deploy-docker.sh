#!/bin/bash
# ============================================================
# JobListingWeb - Docker Deployment Script
# ============================================================
# This script builds and starts the full application stack
# with Docker Compose.
#
# Usage:
#   ./scripts/deploy-docker.sh [environment]
#   environments: dev (default), staging, prod
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

# Parse arguments
ENVIRONMENT=${1:-dev}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================================"
echo "  JobListingWeb - Docker Deployment"
echo "  Environment: $ENVIRONMENT"
echo "============================================================"

# Validate environment
case $ENVIRONMENT in
    dev)
        COMPOSE_FILES="-f docker-compose.yml"
        ;;
    staging)
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.staging.yml"
        ;;
    prod|production)
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
        echo -e "${RED}[WARNING] Deploying to PRODUCTION!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    *)
        echo -e "${RED}[ERROR] Unknown environment: $ENVIRONMENT${NC}"
        echo "Valid environments: dev, staging, prod"
        exit 1
        ;;
esac

cd "$PROJECT_ROOT"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed.${NC}"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Compose is not installed.${NC}"
    exit 1
fi

# Validate required environment variables
echo ""
echo "Validating environment variables..."
REQUIRED_VARS="DB_SA_PASSWORD JWT_SECRET"
for VAR in $REQUIRED_VARS; do
    VALUE=$(eval echo \$$VAR)
    if [ -z "$VALUE" ]; then
        echo -e "${RED}[ERROR] $VAR is not set in .env file${NC}"
        echo "Please update your .env file with the required values."
        exit 1
    fi
done
echo -e "${GREEN}[OK] All required environment variables are set${NC}"

# Build images
echo ""
echo "Building Docker images..."
docker compose $COMPOSE_FILES build --no-cache

# Start services
echo ""
echo "Starting services..."
docker compose $COMPOSE_FILES up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker compose $COMPOSE_FILES ps

echo ""
echo "============================================================"
echo -e "${GREEN}Deployment complete!${NC}"
echo "============================================================"
echo ""
echo "Service URLs:"
echo "  Frontend:    http://localhost:3000"
echo "  API:         http://localhost:5070"
echo "  Swagger:     http://localhost:5070/swagger"
echo ""
echo "View logs:"
echo "  docker compose $COMPOSE_FILES logs -f"
echo ""
echo "Stop services:"
echo "  docker compose $COMPOSE_FILES down"
echo "============================================================"
