#!/bin/bash
# Supabase Setup Script
# This script helps set up Supabase and apply migrations

set -e

echo "🚀 Supabase Setup Script"
echo "========================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    echo "   Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if user wants to use local or cloud
read -p "Do you want to use Supabase Cloud? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 Supabase Cloud Setup:"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Get your project reference ID from the project settings"
    echo "3. Link your local project: supabase link --project-ref YOUR_PROJECT_REF"
    echo "4. Apply migrations: supabase db push"
    echo ""
    read -p "Have you linked your project? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Applying migrations..."
        supabase db push
        echo "✅ Migrations applied!"
    else
        echo "⚠️  Please link your project first, then run: supabase db push"
    fi
else
    echo ""
    echo "📋 Local Supabase Setup:"
    echo "Starting local Supabase instance..."
    supabase start
    
    echo ""
    echo "📦 Applying migrations..."
    supabase db reset
    
    echo ""
    echo "✅ Local Supabase is running!"
    echo ""
    echo "📋 Connection details:"
    supabase status
    echo ""
    echo "💡 Update your .env.local with the connection details above"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Test the connection: curl http://localhost:3000/api/health"
echo ""

