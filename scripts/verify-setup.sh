#!/bin/bash
# Verification Script
# Checks if all required setup steps are completed

set -e

echo "🔍 Verifying Setup"
echo "=================="
echo ""

ERRORS=0

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js version: $(node -v)"
else
    echo "❌ Node.js version must be 20.x or higher (current: $(node -v))"
    ERRORS=$((ERRORS + 1))
fi

# Check if dependencies are installed
if [ -d "apps/web/node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run: cd apps/web && npm install"
    ERRORS=$((ERRORS + 1))
fi

# Check for .env.local
if [ -f "apps/web/.env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check for required variables
    source apps/web/.env.local 2>/dev/null || true
    
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    MISSING_VARS=0
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo "  ⚠️  Missing: $var"
            MISSING_VARS=$((MISSING_VARS + 1))
        fi
    done
    
    if [ $MISSING_VARS -eq 0 ]; then
        echo "✅ Required environment variables are set"
    else
        echo "❌ Some required environment variables are missing"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  .env.local file not found"
    echo "   Copy .env.example to apps/web/.env.local and fill in values"
    ERRORS=$((ERRORS + 1))
fi

# Check if Supabase CLI is available (optional)
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed"
else
    echo "⚠️  Supabase CLI not installed (optional, but recommended)"
fi

# Check TypeScript compilation
echo ""
echo "🔨 Checking TypeScript compilation..."
cd apps/web
if npx tsc --noEmit 2>&1 | head -20; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation errors found"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# Check if build works
echo ""
echo "🔨 Checking build..."
cd apps/web
if npm run build 2>&1 | tail -5; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

echo ""
echo "=================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed! Ready to deploy."
else
    echo "❌ Found $ERRORS issue(s). Please fix them before deploying."
fi
echo ""

