#!/bin/bash
# Test Supabase Connection

echo "🔌 Testing Supabase Connection"
echo "=============================="
echo ""

cd /Users/ciepolml/Projects/accountant/apps/web

if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Test connection with anon key
echo "🔍 Testing connection with anon key..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" 2>&1)

if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    echo "✅ Connection successful (HTTP $response)"
    echo "   The endpoint exists and is accessible"
else
    echo "⚠️  Connection test returned HTTP $response"
    echo "   This might be normal - checking if it's a 401/403..."
fi

echo ""

# Check if service role key is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
    echo "   Get it from: https://supabase.com/dashboard/project/ltxtdeiefjefpluaucgz/settings/api"
else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
fi

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set"
    echo "   Get it from: https://supabase.com/dashboard/project/ltxtdeiefjefpluaucgz/settings/database"
else
    echo "✅ DATABASE_URL is set"
fi

echo ""
echo "📋 Next steps:"
echo "1. Add missing environment variables to .env.local"
echo "2. Restart dev server: npm run dev"
echo "3. Test health endpoint: curl http://localhost:3000/api/health"
echo ""

