#!/bin/bash
# Check Supabase Configuration

echo "🔍 Checking Supabase Configuration"
echo "==================================="
echo ""

ERRORS=0

# Check if .env.local exists
if [ -f "apps/web/.env.local" ]; then
    echo "✅ .env.local file found"
    source apps/web/.env.local
else
    echo "❌ .env.local file not found"
    echo "   Create it with: cd apps/web && cp .env.example .env.local"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check required environment variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

echo "📋 Checking environment variables:"
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "  ❌ Missing: $var"
        ERRORS=$((ERRORS + 1))
    else
        # Mask sensitive values
        value="${!var}"
        if [ ${#value} -gt 20 ]; then
            masked="${value:0:10}...${value: -10}"
        else
            masked="***"
        fi
        echo "  ✅ $var = $masked"
    fi
done

echo ""

# Check Supabase URL format
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    if [[ "$NEXT_PUBLIC_SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
        echo "✅ Supabase URL format looks correct"
    else
        echo "⚠️  Supabase URL format may be incorrect (should be https://*.supabase.co)"
    fi
fi

echo ""

# Test Supabase connection (if credentials are available)
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "🔌 Testing Supabase connection..."
    
    # Try to connect using curl
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" 2>&1)
    
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        echo "✅ Supabase connection successful (HTTP $response)"
    else
        echo "⚠️  Supabase connection test returned HTTP $response"
        echo "   This might be normal if the endpoint doesn't exist"
    fi
else
    echo "⚠️  Cannot test connection - missing credentials"
fi

echo ""
echo "==================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ Supabase configuration looks good!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure migrations are applied in Supabase"
    echo "2. Test the health endpoint: curl http://localhost:3000/api/health"
else
    echo "❌ Found $ERRORS issue(s) with Supabase configuration"
    echo ""
    echo "To fix:"
    echo "1. Create .env.local: cd apps/web && cp .env.example .env.local"
    echo "2. Fill in your Supabase credentials from https://supabase.com/dashboard"
fi
echo ""

