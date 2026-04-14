#!/bin/bash
# ============================================================
# JobListingWeb - Database Initialization Script
# ============================================================
# This script:
#   1. Creates the database if it doesn't exist
#   2. Runs EF Core migrations
#   3. Seeds initial data (roles, admin user)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/JobListingWebAPI"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Database connection settings
DB_SERVER=${DB_SERVER:-localhost}
DB_NAME=${DB_NAME:-JobListingWebDatabase}
DB_USER=${DB_USER:-sa}
DB_PASSWORD=${DB_PASSWORD:-$DB_SA_PASSWORD}

echo "============================================================"
echo "  JobListingWeb - Database Initialization"
echo "============================================================"
echo "  Server:   $DB_SERVER"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "============================================================"

cd "$API_DIR"

# Build the project first
echo ""
echo "Building API project..."
dotnet build --configuration Release

# Create database if not exists
echo ""
echo "Ensuring database exists..."
dotnet ef database create --no-build 2>/dev/null || {
    echo "Database creation skipped (may already exist or using existing connection)"
}

# Run migrations
echo ""
echo "Applying EF Core migrations..."
dotnet ef database update --no-build

echo ""
echo "============================================================"
echo -e "${GREEN}Database initialization complete!${NC}"
echo "============================================================"
echo ""
echo "Default admin credentials:"
echo "  Email:    admin@joblistingweb.com"
echo "  Password: Admin@123"
echo ""
echo "IMPORTANT: Change this password immediately in production!"
echo "============================================================"
