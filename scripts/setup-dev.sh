#!/bin/bash
# ============================================================
# JobListingWeb - Local Development Setup Script
# ============================================================
# This script sets up the local development environment
# Prerequisites: .NET 8 SDK, Node.js 20+, Docker (optional)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================================"
echo "  JobListingWeb - Local Development Setup"
echo "============================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisite() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}[ERROR] $1 is not installed. Please install $1 first.${NC}"
        exit 1
    else
        echo -e "${GREEN}[OK] $1 found: $($1 --version 2>/dev/null || echo "installed")${NC}"
    fi
}

echo ""
echo "Checking prerequisites..."
check_prerequisite dotnet
check_prerequisite node

# .NET version check
DOTNET_VERSION=$(dotnet --version 2>/dev/null | cut -d'.' -f1)
if [ "$DOTNET_VERSION" -lt 8 ]; then
    echo -e "${RED}[ERROR] .NET 8.0 or higher is required. Found: .NET $DOTNET_VERSION${NC}"
    exit 1
fi

# Node version check
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}[ERROR] Node.js 18+ is required. Found: Node.js $NODE_VERSION${NC}"
    exit 1
fi

echo ""
echo "Setting up environment..."

# Create .env from example if not exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        echo -e "${YELLOW}[INFO] Created .env from .env.example. Please update it with your values.${NC}"
    else
        echo -e "${RED}[ERROR] .env.example not found. Cannot create .env${NC}"
        exit 1
    fi
fi

# Load environment variables
set -a
source "$PROJECT_ROOT/.env"
set +a

echo ""
echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/JobListingWebClient"
npm install

echo ""
echo "Restoring .NET dependencies..."
cd "$PROJECT_ROOT/JobListingWebAPI"
dotnet restore

echo ""
echo "============================================================"
echo -e "${GREEN}Setup complete!${NC}"
echo "============================================================"
echo ""
echo "To run the application, choose one of these options:"
echo ""
echo "  Option 1: Run locally (no Docker)"
echo "    Terminal 1: cd JobListingWebAPI && dotnet run"
echo "    Terminal 2: cd JobListingWebClient && npm start"
echo ""
echo "  Option 2: Run with Docker"
echo "    docker compose up -d"
echo ""
echo "  Option 3: Run with Docker (verbose)"
echo "    docker compose up"
echo ""
echo "============================================================"
echo ""
echo "IMPORTANT: Before running, update your .env file with:"
echo "  - DB_SA_PASSWORD"
echo "  - JWT_SECRET (generate: openssl rand -base64 64)"
echo "  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional)"
echo "  - Other service credentials as needed"
echo "============================================================"
