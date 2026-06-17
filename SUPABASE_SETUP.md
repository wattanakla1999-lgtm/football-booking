# Supabase Setup Guide

This project is configured to use Supabase as the primary PostgreSQL database using Prisma ORM. Follow these steps to configure your database.

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **New Project**, select an organization, and provide a name and secure database password.
3. Wait for the database to finish provisioning.

## 2. Get Connection Strings
Once your project is ready, navigate to **Project Settings > Database**.

### Pooler URL (DATABASE_URL)
1. Under **Connection Pooler**, ensure it is enabled.
2. Copy the Connection String (URI).
3. Append `?pgbouncer=true&connection_limit=1` to the URL.
   *(This prevents Prisma from exhausting the pooler's connections).*
4. In your `.env` file, replace `DATABASE_URL` with this value.

### Direct URL (DIRECT_URL)
1. In the same **Database** settings page, look for the **Direct Connection**.
2. Copy the Connection String (URI). It usually runs on port `5432`.
3. In your `.env` file, replace `DIRECT_URL` with this value.

> **Example `.env` configuration:**
> ```env
> DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
> DIRECT_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
> ```

## 3. Apply Schema
You have two options to apply the schema to your Supabase project:

### Option A: Using Prisma Migrate (Recommended)
Run the following command in your terminal to push the schema and create migration history:
```bash
npx prisma migrate dev --name init_supabase
```

### Option B: Using Supabase SQL Editor
If you prefer not to use Prisma migrate, you can manually execute the raw SQL:
1. Open the `supabase_migration.sql` file in this repository.
2. Copy its contents.
3. Go to the **SQL Editor** in your Supabase dashboard.
4. Paste and click **Run**.

## 4. Seed the Database
Run the seed script to create the default organization, an admin user, and sample football courts:
```bash
npx prisma db seed
```

You're now ready to use Supabase!
