# ============================================================
# JobListingWeb - Secrets & Configuration Guide
# ============================================================
# This file documents all secrets and configuration needed
# for running the application in different environments.
# ============================================================

# -------------------- REQUIRED SECRETS --------------------

# 1. DB_SA_PASSWORD (Required)
#    SQL Server System Administrator password
#    - Minimum 8 characters
#    - Must include uppercase, lowercase, digits, and special chars
#    - Example: MyStr0ng!P@ssw0rd
DB_SA_PASSWORD=

# 2. JWT_SECRET (Required)
#    Secret key for signing JWT tokens
#    - Generate with: openssl rand -base64 64
#    - Minimum 32 characters recommended
#    - Keep this secret - it's used to validate tokens
JWT_SECRET=

# -------------------- OPTIONAL SECRETS --------------------

# 3. Google OAuth (Optional - for Google login)
#    Get from: https://console.cloud.google.com/apis/credentials
#    Create an OAuth 2.0 Client ID (Web application)
#    Authorized redirect URIs:
#      - http://localhost:5070/signin-google (development)
#      - https://yourdomain.com/signin-google (production)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# 4. Email Settings (Optional - for sending emails)
#    For Gmail: Use App Password (enable 2FA first)
#    https://support.google.com/accounts/answer/185833
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_FROM=
EMAIL_FROM_NAME=JobListingWeb

# 5. Azure Blob Storage (Optional - for file uploads)
#    - Development: Use Azurite (local emulator)
#    - Production: Azure Blob Storage connection string
#    Get from: https://portal.azure.com > Storage Accounts
AZURE_STORAGE_CONNECTION_STRING=

# 6. AI / Gemini API (Optional - for AI chatbot)
#    Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=

# 7. OpenAI API (Optional - for AI features)
#    Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# -------------------- CONFIGURATION --------------------

# Database
DB_NAME=JobListingWebDatabase

# Redis
REDIS_PASSWORD=redis123

# Application
ASPNETCORE_ENVIRONMENT=Development

# JWT
JWT_ISSUER=https://api.example.com
JWT_AUDIENCE=ApplicationUser

# Frontend URLs (used in Docker builds)
REACT_APP_API_URL=http://localhost:7082/api
REACT_APP_UI_URL=http://localhost:3000

# -------------------- ENVIRONMENT-SPECIFIC NOTES --------------------

# DEVELOPMENT:
#   - Use local SQL Server or Docker SQL Server
#   - Use Azurite for blob storage
#   - Use development JWT secret (OK to be simple)
#   - Google OAuth: Use localhost redirect URI

# STAGING:
#   - Use dedicated staging database
#   - Use real Azure Blob Storage
#   - Generate strong JWT secret
#   - Register staging domain in Google OAuth

# PRODUCTION:
#   - Use production database with proper backup
#   - Use production Azure Blob Storage
#   - Generate cryptographically secure JWT secret
#   - Register production domain in Google OAuth
#   - Use proper email service (SendGrid, AWS SES, etc.)
#   - Enable HTTPS/TLS

# -------------------- GITHUB ACTIONS SECRETS --------------------

# Add these secrets in GitHub > Settings > Secrets and variables > Actions

# Required:
#   DB_SA_PASSWORD       - SQL Server password
#   JWT_SECRET           - JWT signing key

# Optional:
#   GOOGLE_CLIENT_ID     - Google OAuth client ID
#   GOOGLE_CLIENT_SECRET - Google OAuth client secret
#   EMAIL_USERNAME       - Email sender
#   EMAIL_PASSWORD       - Email password/app password
#   AZURE_STORAGE_CONNECTION_STRING
#   GEMINI_API_KEY
#   OPENAI_API_KEY

# -------------------- GITHUB ACTIONS VARIABLES --------------------

# Add these in GitHub > Settings > Secrets and variables > Actions > Variables

# Required:
#   API_BASE_URL         - Production API base URL
#   UI_BASE_URL          - Production frontend base URL

# Staging/Production SSH (for deployment):
#   STAGING_HOST         - Staging server hostname/IP
#   STAGING_USER         - Staging SSH username
#   STAGING_SSH_KEY      - Staging SSH private key
#   STAGING_DEPLOY_PATH  - Deployment path on staging server
#   PROD_HOST            - Production server hostname/IP
#   PROD_USER            - Production SSH username
#   PROD_SSH_KEY         - Production SSH private key
#   PROD_DEPLOY_PATH     - Deployment path on production server
