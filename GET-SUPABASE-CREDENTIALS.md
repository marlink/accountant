# Get Remaining Supabase Credentials

You've provided:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You still need:
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ `DATABASE_URL`

## How to Get Them

### 1. Go to Supabase Dashboard
https://supabase.com/dashboard/project/ltxtdeiefjefpluaucgz

### 2. Get Service Role Key
1. Click **Project Settings** (gear icon)
2. Go to **API** section
3. Find **service_role** key (⚠️ Keep this secret!)
4. Copy the key

### 3. Get Database URL
1. In **Project Settings**
2. Go to **Database** section
3. Find **Connection string** → **URI**
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

The format should be:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ltxtdeiefjefpluaucgz.supabase.co:5432/postgres
```

### 4. Update .env.local

Add these two lines to `apps/web/.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
DATABASE_URL=postgresql://postgres:your-password@db.ltxtdeiefjefpluaucgz.supabase.co:5432/postgres
```

### 5. Restart Dev Server

After updating `.env.local`, restart the dev server:
```bash
# Stop current server (Ctrl+C)
cd apps/web
npm run dev
```

### 6. Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

## Security Note

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.

The service role key has admin access - keep it secret!

