# ============================================================
# JobListingWeb Client - Dockerfile
# Multi-stage build for React SPA with NGINX
# ============================================================
# Build args (can be overridden):
#   REACT_APP_API_URL   - Backend API base URL
#   REACT_APP_UI_URL    - Frontend base URL
#
# Ports:
#   80  - HTTP (NGINX)
#   443 - HTTPS (NGINX)
# ============================================================

# -------------------- Stage 1: Build --------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL=https://localhost:7082/api
ARG REACT_APP_UI_URL=https://localhost:3000

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_UI_URL=${REACT_APP_UI_URL}

# Build React app
RUN npm run build

# -------------------- Stage 2: Production NGINX --------------------
FROM nginx:alpine AS production

# Remove default NGINX config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
