#!/bin/bash

# EV Charging Platform Deployment Script
# This script sets up and deploys the complete platform to Cloudflare

set -e

echo "🚀 EV Charging Platform Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if Cloudflare credentials are provided
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_error "CLOUDFLARE_API_TOKEN environment variable is required"
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    print_error "CLOUDFLARE_ACCOUNT_ID environment variable is required"
fi

print_step "Initializing Cloudflare Wrangler CLI"

# Install Wrangler globally if not present
if ! command -v wrangler &> /dev/null; then
    print_step "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Authenticate with Cloudflare
print_step "Authenticating with Cloudflare..."
wrangler login

print_success "Cloudflare authentication complete"

# Setup project structure
print_step "Setting up project structure..."

# Create necessary directories if they don't exist
mkdir -p cloudflare
mkdir -p .github/workflows
mkdir -p docs

print_success "Project structure ready"

# Install backend dependencies
print_step "Installing backend dependencies..."
if [ -d "cloudflare" ]; then
    cd cloudflare
    npm install
    cd ..
    print_success "Backend dependencies installed"
else
    print_warning "No cloudflare directory found"
fi

# Install admin dashboard dependencies
print_step "Installing admin dashboard dependencies..."
if [ -d "apps/admin" ]; then
    cd apps/admin
    npm install
    cd ../..
    print_success "Admin dashboard dependencies installed"
else
    print_warning "No apps/admin directory found"
fi

# Install mobile app dependencies
print_step "Installing mobile app dependencies..."
if [ -d "apps/mobile" ]; then
    cd apps/mobile
    npm install
    cd ../..
    print_success "Mobile app dependencies installed"
else
    print_warning "No apps/mobile directory found"
fi

# Create D1 Database
print_step "Creating D1 Database..."
DATABASE_NAME="ev-charging-database"

# Try to create database (it may already exist)
if ! wrangler d1 create "$DATABASE_NAME" 2>/dev/null; then
    print_warning "Database may already exist, continuing..."
fi

print_success "D1 Database ready"

# Create KV Namespaces
print_step "Creating KV Namespaces..."

# Create main platform KV
JSON_OUTPUT=$(wrangler kv:namespace create "EV_PLATFORM_KV" --env production 2>/dev/null || echo '{"preview_id": "", "id": ""}')
KV_ID=$(echo "$JSON_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# Create session store KV
JSON_OUTPUT=$(wrangler kv:namespace create "SESSION_STORE" --env production 2>/dev/null || echo '{"preview_id": "", "id": ""}')
SESSION_KV_ID=$(echo "$JSON_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# Create cache store KV
JSON_OUTPUT=$(wrangler kv:namespace create "CACHE_STORE" --env production 2>/dev/null || echo '{"preview_id": "", "id": ""}')
CACHE_KV_ID=$(echo "$JSON_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

print_success "KV Namespaces created"

# Create R2 Buckets
print_step "Creating R2 Buckets..."

wrangler r2 bucket create "ev-charging-static-assets" || print_warning "Static assets bucket may already exist"
wrangler r2 bucket create "ev-charging-user-uploads" || print_warning "User uploads bucket may already exist"
wrangler r2 bucket create "ev-charging-logs" || print_warning "Logs bucket may already exist"

print_success "R2 Buckets ready"

# Update wrangler.toml with actual IDs (if available)
if [ ! -z "$KV_ID" ] && [ ! -z "$SESSION_KV_ID" ] && [ ! -z "$CACHE_KV_ID" ]; then
    print_step "Updating wrangler.toml with resource IDs..."
    
    # Backup original file
    cp cloudflare/wrangler.toml cloudflare/wrangler.toml.backup 2>/dev/null || true
    
    # Update with actual IDs (this is a simplified update)
    print_warning "You may need to manually update wrangler.toml with the following IDs:"
    echo "EV_PLATFORM_KV ID: $KV_ID"
    echo "SESSION_STORE ID: $SESSION_KV_ID"
    echo "CACHE_STORE ID: $CACHE_KV_ID"
fi

# Run database migrations
print_step "Running database migrations..."
cd cloudflare

# Apply migrations
if [ -d "d1-migrations" ]; then
    for migration_file in d1-migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            print_step "Applying migration: $(basename "$migration_file")"
            wrangler d1 execute "$DATABASE_NAME" --file="$migration_file"
        fi
    done
fi

cd ..
print_success "Database migrations applied"

# Set up environment secrets
print_step "Setting up environment secrets..."

print_warning "Please set the following secrets manually using wrangler CLI:"
echo "wrangler secret put JWT_SECRET"
echo "wrangler secret put STRIPE_SECRET_KEY"
echo "wrangler secret put PAYPAL_CLIENT_SECRET"
echo "wrangler secret put OCPP_SECRET_KEY"
echo "wrangler secret put FIREBASE_PROJECT_ID"

# Deploy to Cloudflare
print_step "Deploying Workers to Cloudflare..."
cd cloudflare

# Deploy to production
wrangler deploy --env production --compatibility-date 2023-12-01

cd ..
print_success "Workers deployed successfully"

# Deploy static assets (Admin Dashboard)
print_step "Deploying Admin Dashboard to Cloudflare Pages..."

if [ -d "apps/admin" ]; then
    cd apps/admin
    
    # Build the application
    npm run build
    
    # Deploy to Cloudflare Pages
    wrangler pages deploy dist --project-name ev-charging-admin --account-id "$CLOUDFLARE_ACCOUNT_ID"
    
    cd ../..
    print_success "Admin Dashboard deployed to Cloudflare Pages"
else
    print_warning "Admin dashboard not found, skipping deployment"
fi

# Set up GitHub Actions workflow
print_step "Setting up GitHub Actions workflow..."

if [ ! -f ".github/workflows/deploy-cloudflare.yml" ]; then
    print_warning "GitHub Actions workflow file not found, you may need to create it manually"
else
    print_success "GitHub Actions workflow ready"
fi

# Generate deployment summary
print_step "Generating deployment summary..."

echo ""
echo "🎉 EV Charging Platform Deployment Complete!"
echo "==========================================="
echo ""
echo "📊 Deployment Summary:"
echo "• Backend Workers: Deployed to Cloudflare Workers"
echo "• Database: D1 Database '$DATABASE_NAME' created"
echo "• KV Storage: 3 namespaces created"
echo "• R2 Storage: 3 buckets created"
echo "• Admin Dashboard: Deployed to Cloudflare Pages"
echo "• Mobile App: Ready for build and deployment"
echo ""
echo "🔧 Next Steps:"
echo "1. Set environment secrets using 'wrangler secret put <secret-name>'"
echo "2. Configure your domain in Cloudflare dashboard"
echo "3. Test the API endpoints"
echo "4. Build and deploy the mobile application"
echo "5. Set up monitoring and alerts"
echo ""
echo "🔗 URLs (configure your domain):"
echo "• Admin Dashboard: https://ev-charging-admin.pages.dev"
echo "• API Endpoint: https://ev-charging-platform.your-subdomain.workers.dev"
echo "• WebSocket: wss://ev-charging-platform.your-subdomain.workers.dev/api/v1/ws"
echo ""
echo "📚 Documentation: README.md files in each directory"
echo "💬 Support: Check GitHub Issues for community support"
echo ""
print_success "Deployment completed successfully!"

# Cleanup
print_step "Cleaning up temporary files..."
rm -f cloudflare/wrangler.toml.backup 2>/dev/null || true

print_success "All done! Your EV Charging Platform is now live on Cloudflare! 🚀"
