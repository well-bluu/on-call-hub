<div align="center">

<img src="docs/images/oncallhub-logo.png" alt="On Call Hub logo" width="240" />

# On Call Hub

### Right People. Right Time.

**Shift scheduling for Frens Ice Cream: owners post shifts, on-call workers get offers on their phones.**

</div>

The owner posts a shift once, and the app offers it to on-call workers one at a time, in priority order, until someone accepts.

- **Owner** (mostly desktop): creates and edits shifts, sees who has been offered each shift and who accepted, approves or rejects cancellation requests, and invites, edits and deactivates workers.
- **Worker** (mostly phone): accepts or declines offers, sees upcoming and past shifts, asks to cancel an accepted shift, and keeps their profile, photo and documents up to date.

All times are Philippine time (Asia/Manila).

## Tech stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/4A0I5XKEG6156auITYNH8t/FRENS--SoftEng-1-?node-id=98-4059)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)

- **App:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, shadcn/ui parts, lucide-react icons, Geist font
- **Backend:** Supabase Auth, Postgres with row-level security, and Storage
- **Database changes:** SQL migrations in `supabase/migrations`, applied with the Supabase CLI

> **Heads up:** this Next.js version has breaking changes from older versions. Read the guide in `node_modules/next/dist/docs/` before writing Next.js code.

## Getting started

You need Node.js (a current LTS release is fine), npm, and access to the team's Supabase project.

1. Clone and install:

   ```bash
   git clone https://github.com/well-bluu/on-call-hub.git
   cd on-call-hub
   npm install
   ```

2. Create `.env.local` in the project root. Ask the backend team for the values.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SECRET_KEY=
   ```

   `SUPABASE_SECRET_KEY` is server-only; it's used to send worker invitations. Never give it a `NEXT_PUBLIC_` prefix, never import it in a client component, and never commit `.env.local` (it's already in `.gitignore`).

3. Run the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. You'll be sent to the login page, and after signing in owners land on `/owner/dashboard` and workers on `/dashboard`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (run before opening a PR) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project structure

```
app/
  (owner)/owner/        Owner pages: dashboard, shift-management, workers, notifications, help-support
  (workers)/            Worker pages: dashboard, my_shift, notifications, my_profile, help_support
  auth/                 Login, sign-up, forgot/update password, confirm, error
components/             Shared UI: sidebar, header, nav, cards, forms
components/ui/          shadcn/ui primitives (button, card, input, ...)
lib/
  supabase/             Browser and server clients, session proxy, generated database types
  auth/                 requirePermission() for server-side permission checks
  shifts/ cancellations/ notifications/ documents/   Data queries per feature
proxy.ts                Refreshes the session and sends signed-out users to /auth/login
supabase/
  migrations/           Every database change, in order
  templates/            Auth email templates (worker invite)
  config.toml           Supabase CLI config, including the custom access token hook
public/documents/       Help PDFs (owner and worker manuals, shift policies, ...)
public/pictures2/       Logos
```

## How it works

### Roles and permissions

Each user has a role (`owner` or `worker`) in `public.user_roles`. A custom access token hook (`public.custom_access_token_hook`) puts the role into the user's token and refuses sign-in for deactivated workers. Pages check permissions on the server with `requirePermission("shift.create")` and similar calls. The database enforces the same rules with row-level security, so hiding a button is never the only check.

### Filling a shift

1. The owner creates a shift.
2. The database offers it to the next eligible worker in `worker_priority_queue`. Eligible means active, not already asked for this shift, and without a clashing shift.
3. The worker accepts or declines. A decline, or an offer that expires, moves the offer to the next worker.
4. Each step creates a notification for the owner and the worker.

The offer logic lives in database functions (see `supabase/migrations`), not in the Next.js code.

### Workers and documents

The owner adds workers by invitation (`app/(owner)/owner/workers/actions.ts`). Profile photos and documents are stored in private Supabase Storage buckets and shown through signed URLs.

## Database changes

Every schema change is a migration file. Don't make changes by hand in the Supabase dashboard.

```bash
npx supabase migration new short_description     # creates supabase/migrations/<timestamp>_short_description.sql
# write the SQL, then, after review:
npx supabase db push                               # applies new migrations to the linked project
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

Check the result with `npx supabase db advisors --linked`. Pushing to the shared project is done by the backend team; open a PR with the migration first.

## Contributing

- **Tickets:** all work is tracked in Jira as `OCH-<number>`.
- **Branches:** `feat/OCH-123-short-name` for features, `fix/OCH-123-short-name` for fixes.
- **Commits:** `feat(OCH-123): what changed` or `fix(OCH-123): what changed`.
- **Before a PR:** run `npm run lint` and `npm run build`, and click through the pages you changed as both the owner and a worker, on desktop and at phone width.

## Design and product notes

- [Figma designs](https://www.figma.com/design/4A0I5XKEG6156auITYNH8t/FRENS--SoftEng-1-?node-id=98-4059): the original screen designs.
- [PRODUCT.md](PRODUCT.md): who the users are, what the product does, and its principles.
- [DESIGN.md](DESIGN.md): colours, type, components, and rules for new UI (blue is only for things you can press, no text under 12px, capitals only for headings and labels).
