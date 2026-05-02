# Simple Hosting Guide for Sir Isaac

## What you need

1. A laptop.
2. A Supabase account.
3. A Vercel or Netlify account.

## Best workflow

1. Create Supabase project.
2. Run the SQL file: `supabase/schema_and_seed.sql`.
3. Create facilitator login accounts in Supabase Authentication.
4. Add Supabase URL and anon key to `.env.local`.
5. Upload the project to GitHub.
6. Deploy on Vercel.
7. Share the public link with members.
8. Keep the admin link for facilitators only.

## After deployment

- Public link: share this one on WhatsApp.
- Admin link: add `#admin` at the end of the public link.

Example:

- Public: `https://p2p-contribution.vercel.app/`
- Admin: `https://p2p-contribution.vercel.app/#admin`

When you add a new contribution through the admin dashboard, the public page updates automatically.
