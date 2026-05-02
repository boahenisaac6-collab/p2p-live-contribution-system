# Peer-to-Peer Tuition Live Contribution Management System

This is the advanced version of your contribution register. It is no longer a simple HTML file. It is a modern live web application with:

- Public view page for all members.
- Private admin dashboard for facilitators.
- Supabase online database.
- Automatic live updates.
- Search in public view and admin view.
- Partial payments highlighted.
- Last person who paid shown in admin mode.
- Print/PDF mode for public and admin.
- Export to CSV from admin.

The system was prepared using the contribution records from your uploaded register.

## Important links after hosting

After deploying online, you will use:

- Public link: `https://your-site-name.vercel.app/`
- Admin link: `https://your-site-name.vercel.app/#admin`

Members should receive only the public link. Facilitators should use the admin link.

## How automatic updating works

1. A facilitator opens the admin link.
2. The facilitator logs in.
3. The facilitator adds or edits a contribution.
4. The record is saved in Supabase.
5. Everyone using the public link sees the new update automatically.

No new HTML file has to be downloaded or shared.

## Setup steps

### Step 1: Create Supabase project

1. Go to Supabase and create a new project.
2. Open the project dashboard.
3. Go to **SQL Editor**.
4. Open `supabase/schema_and_seed.sql` from this package.
5. Paste everything into Supabase SQL Editor and click **Run**.

This creates the contribution table and loads the existing 119 records.

### Step 2: Create facilitator login accounts

In Supabase:

1. Go to **Authentication**.
2. Go to **Users**.
3. Add user accounts for the facilitators.
4. Use email and password login.

Only those with facilitator email/password can enter the admin dashboard.

### Step 3: Add your Supabase keys

1. In Supabase, go to **Project Settings**.
2. Open **API**.
3. Copy your **Project URL** and **anon public key**.
4. Rename `.env.example` to `.env.local`.
5. Paste the values like this:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Run on your laptop

Install Node.js first. Then open this folder in Terminal or Command Prompt and run:

```bash
npm install
npm run dev
```

Open the local link shown in the terminal.

### Step 5: Host online

Recommended hosting platforms:

- Vercel
- Netlify
- Firebase Hosting

When hosting, add the same environment variables in the hosting dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Recommended security setting

In Supabase Authentication settings, disable open public sign-up after creating facilitator accounts. This helps prevent unknown people from creating accounts and accessing the admin dashboard.

## Public View

The public view shows:

- Name
- Amount
- Search box
- Partial payment colours
- Neat public printout
- Thank-you message
- Facilitators' contacts

## Admin Dashboard

The admin dashboard shows:

- Add contributor
- Edit contributor
- Delete contributor
- Search contributor
- Last person who paid
- Total amount
- Partial payments
- Print admin report
- Export CSV

## Facilitator contacts on public printout

- BOOKDR: 0242930088
- SHEDICK: 0241878658
- ISAAC: 0248481762
