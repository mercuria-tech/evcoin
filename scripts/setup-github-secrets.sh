#!/bin/bash

# GitHub Secrets Setup Script for EV Charging Platform
# This script helps configure GitHub repository secrets for CI/CD

set -e

echo "🔐 GitHub Secrets Setup for EV Charging Platform"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    print_error "Please authenticate with GitHub CLI first:"
    echo "  Run: gh auth login"
    exit 1
fi

print_step "Setting up GitHub repository secrets..."

# Repository information
REPO="mercuria-tech/evcoin"

# Check if repository exists and user has access
if ! gh repo view "$REPO" &> /dev/null; then
    print_error "Cannot access repository $REPO or it doesn't exist"
    echo "Please ensure you have push access to the repository"
    exit 1
fi

print_success "Repository access confirmed: $REPO"

# Function to set secrets
set_secret() {
    local secret_name=$1
    local secret_description=$2
    
    print_step "Setting up secret: $secret_name"
    
    read -sp "Enter $secret_description: " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        print_warning "Skipping $secret_name (empty value)"
        return
    fi
    
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    print_success "Secret $secret_name has been set"
}

# Required secrets for Cloudflare deployment
print_step "Configuring Cloudflare secrets..."

set_secret "CLOUDFLARE_API_TOKEN" "your Cloudflare API token (provided: f43966b2b584f52cffb008d25f8e0488deea2)"
set_secret "CLOUDFLARE_ACCOUNT_ID" "your Cloudflare Account ID (find in Cloudflare dashboard)"

print_step "Configuring application secrets..."

# Application configuration secrets
set_secret "JWT_SECRET" "JWT signing secret key (use a strong random string)"
set_secret "STRIPE_SECRET_KEY" "Stripe secret key for payment processing"
set_secret "PAYPAL_CLIENT_SECRET" "PayPal client secret for payment processing"
set_secret "OCPP_SECRET_KEY" "OCPP server secret key for charging stations"
set_secret "FIREBASE_PROJECT_ID" "Firebase project ID for push notifications"

print_step "Configuring external service secrets..."

# External service secrets
read -p "Enter Google Maps API Key (optional): " google_maps_key
if [ ! -z "$google_maps_key" ]; then
    echo "$google_maps_key" | gh secret set "GOOGLE_MAPS_API_KEY" --repo "$REPO"
    print_success "GOOGLE_MAPS_API_KEY has been set"
fi

read -p "Enter Google Client ID for OAuth (optional): " google_client_id
if [ ! -z "$google_client_id" ]; then
    echo "$google_client_id" | gh secret set "GOOGLE_CLIENT_ID" --repo "$REPO"
    print_success "GOOGLE_CLIENT_ID has been set"
fi

print_step "Configuring mobile app secrets..."

# Mobile application secrets
set_secret "EXPO_TOKEN" "Expo access token for mobile app builds"

# Optional environment-specific secrets
print_step "Configuring environment-specific secrets..."

read -p "Would you like to set staging environment secrets? (y/N): " set_staging
if [[ $set_staging =~ ^[Yy]$ ]]; then
    set_secret "CLOUDFLARE_API_TOKEN_STAGING" "staging Cloudflare API token"
    set_secret "CLOUDFLARE_ACCOUNT_ID_STAGING" "staging Cloudflare Account ID"
fi

# Verify secrets were set
print_step "Verifying secrets..."

SECRETS_LIST=$(gh secret list --repo "$REPO")

echo ""
echo "📋 Repository Secrets Status:"
echo "=============================="

SECRETS=(
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_ACCOUNT_ID" 
    "JWT_SECRET"
    "STRIPE_SECRET_KEY"
    "PAYPAL_CLIENT_SECRET"
    "OCPP_SECRET_KEY"
    "FIREBASE_PROJECT_ID"
    "EXPO_TOKEN"
)

for secret in "${SECRETS[@]}"; do
    if echo "$SECRETS_LIST" | grep -q "$secret"; then
        print_success "✅ $secret"
    else
        print_warning "❌ $secret (missing)"
    fi
done

echo ""
echo "🔧 Next Steps:"
echo "==============="
echo "1. Push your code to trigger deployment:"
echo "   git add ."
echo "   git commit -m '🚀 Deploy EV Charging Platform'"
echo "   git push origin main"
echo ""
echo "2. Monitor deployment in GitHub Actions:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "3. Check Cloudflare Workers dashboard:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "4. Verify deployment at:"
echo "   • API: https://ev-charging-platform.workers.dev/api/v1/health"
echo "   • Admin: https://ev-charging-admin.pages.dev"
echo ""
echo "💡 Pro Tips:"
echo "• Secrets are automatically encrypted by GitHub"
echo "• You can update secrets anytime using 'gh secret set'"
echo "• Use environment branches for different deployments"
echo "• Monitor secret usage in GitHub Actions logs"
echo ""

print_success "GitHub secrets setup complete! 🎉"
