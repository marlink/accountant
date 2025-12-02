---
last_updated: 2025-12-02
source_path: docs/ENVIRONMENT.md
---
# Environment Setup Guide

This guide helps new developers set up their local development environment.

## Prerequisites

- Node.js 20.x or later
- npm or pnpm
- Git
- Supabase CLI (optional, for local Supabase)
- Docker Desktop (optional, for local dependencies)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd accountant
   ```

2. **Install dependencies:**
   ```bash
   cd apps/web
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Detailed Setup

### 1. Node.js Installation

Install Node.js 20.x from https://nodejs.org/ or use a version manager:

```bash
# Using nvm
nvm install 20
nvm use 20
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version
```

### 2. Project Dependencies

The project uses npm. Install dependencies:

```bash
cd apps/web
npm install
```

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

**Required for local development:**

```env
# Supabase (use your Supabase project or local instance)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Optional (for full feature testing):**

```env
# KSeF (only needed to test KSeF integration)
KSEF_CERT_PEM_B64=...
KSEF_KEY_PEM_B64=...
KSEF_API_URL=https://ksef-api.example.com
KSEF_API_SEND_PATH=/invoices

# Bank AIS (only needed to test bank integration)
AIS_PROVIDER_KEYS={"provider":"tink","clientId":"...","clientSecret":"..."}

# Error Tracking (optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development
```

### 4. Database Setup

#### Option A: Use Supabase Cloud (Recommended for MVP)

1. Create a Supabase project at https://supabase.com
2. Get your project credentials
3. Apply migrations via Supabase dashboard SQL editor or CLI:
   ```bash
   supabase db push --project-ref your-project-ref
   ```

#### Option B: Local Supabase (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db reset
   ```

4. Use local credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
   SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
   DATABASE_URL=<from supabase start output>
   ```

### 5. Development Server

Start the Next.js development server:

```bash
cd apps/web
npm run dev
```

The application will be available at `http://localhost:3000`.

### 6. Database Migrations

If using Supabase Cloud, apply migrations manually via dashboard or:

```bash
# Using Supabase CLI (if linked to project)
supabase db push

# Or manually copy SQL from supabase/migrations/ and run in SQL editor
```

Migration files are in `supabase/migrations/` and should be applied in order:
- `0001_init.sql` - Core tables
- `0002_rls.sql` - Row Level Security
- `0003_ksef_retry.sql` - KSeF retry fields
- `0004_alerts.sql` - Alerts table
- `0005_views_dashboard.sql` - Dashboard views
- `0006_invoice_items_parties.sql` - Invoice items and parties
- `0007_idempotency.sql` - Idempotency keys
- `0008_cost_categories.sql` - Cost categories
- `0009_invitations.sql` - User invitations
- `0010_storage.sql` - Storage buckets

### 7. Seed Data (Optional)

Create a seed script to populate test data:

```sql
-- Example seed data (run in Supabase SQL editor)
INSERT INTO companies (name, vat_id) VALUES ('Test Company', '1234563218');
-- Add more seed data as needed
```

## Development Workflow

### Running Linter

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

### Building for Production

```bash
npm run build
npm start
```

## Common Issues

### Port Already in Use

If port 3000 is in use:

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Verify network connectivity
4. Check IP allowlist in Supabase (if configured)

### Module Not Found Errors

1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

### TypeScript Errors

1. Restart TypeScript server in your IDE
2. Run type check: `npx tsc --noEmit`
3. Verify `tsconfig.json` is correct

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### WebStorm / IntelliJ

1. Enable ESLint
2. Configure TypeScript to use project version
3. Enable Tailwind CSS support

## Testing

### Manual Testing

1. Start development server
2. Test key flows:
   - Create invoice
   - List invoices
   - Send to KSeF (if configured)
   - Create expense
   - View VAT registers

### API Testing

Use tools like:
- Postman
- Insomnia
- curl
- VS Code REST Client extension

Example API request:
```bash
curl -X GET http://localhost:3000/api/health \
  -H "Authorization: Bearer your-token"
```

## Next Steps

1. Read the [Architecture Overview](Architecture-Overview.md)
2. Review [API Documentation](Technical.md#api-specifications)
3. Check [Contributing Guide](Contributing.md)
4. Join team communication channels

## Getting Help

- Check existing documentation in `docs/`
- Review code comments
- Ask in team chat
- Create an issue if you find a bug

