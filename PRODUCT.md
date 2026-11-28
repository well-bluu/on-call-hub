# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Owner.** The single owner of Frens Ice Cream, working mostly on a desktop. Posts shifts, watches who has been offered and who has accepted, reviews workers' cancellation requests, and manages the worker list (invite, edit, deactivate).
- **Worker.** On-call staff, working mostly on a phone. Receives shift offers, accepts or declines them, sees upcoming and past shifts, can ask to cancel an accepted shift, and keeps their own profile and documents up to date.

## Product Purpose

On-Call Hub fills Frens Ice Cream's on-call shifts without the owner chasing people one by one. The owner posts a shift once; the system offers it to workers in priority order until it is covered. Success means shifts get filled quickly and fairly, and both sides always know where a shift stands.

## Positioning

Built for one business, Frens Ice Cream, not a general scheduling product. Its core mechanism is a priority queue: each shift is offered to one eligible worker at a time, in queue order, skipping inactive workers, workers already asked, and workers with a clashing shift. A decline or timeout moves the offer to the next person.

## Operating Context

- The owner works at a desk between other shop tasks. Workers check offers on their phones, often away from work, and need to answer quickly.
- All times are Philippine time (Asia/Manila).
- Notifications in the app tell each side about offers, acceptances, declines, confirmations and cancellation requests.
- Onboarding is invite-only: the owner invites a worker by email, and there is no public sign-up page (removed in OCH-212).

## Capabilities and Constraints

- Owner: create and edit shifts, cancel shifts, see shift and offer status on a dashboard and calendar, approve or reject cancellation requests, invite, edit and deactivate workers, view worker detail.
- Worker: accept or decline offers, view upcoming and past shifts, request cancellation of an accepted shift, edit profile details, photo and personal documents.
- A deactivated worker can no longer sign in, loses access even with a still-valid session, and is skipped by the queue. Their pending offers and accepted future shifts are withdrawn, and those shifts go back to the queue (OCH-210).
- When the owner cancels a shift, every pending or accepted worker on it is released (OCH-199).
- Approving a cancellation request only goes through if the shift and the worker's assignment still apply (OCH-211).
- Profile photos and documents are kept in private storage.
- Stack: Next.js (App Router) with Supabase for auth, database, row-level security and storage. Database changes go through SQL migrations.
- Terminology in the UI: "shift", "offer", "cancellation request", "worker", "owner".

## Brand Commitments

- Name shown in the app: "FRENS ICE CREAM"; product name "On Call Hub".
- Logo files: `public/pictures2/oncallHubLogo.png`, `public/pictures2/logo_name.png`.

## Evidence on Hand

- Help documents in `public/documents/`: owner manual, worker manual, shift management, shift policies, worker management, and `guide-logs.pdf`.
- No testimonials, metrics or customer quotes exist; do not invent any.
- The Help & Support FAQ is still placeholder text (tracked in OCH-221); real answers must come from the team, not be made up.

## Product Principles

1. Always show where a shift stands: offered to whom, accepted, declined or cancelled.
2. Make a worker's answer to an offer one quick, clear action on a phone.
3. Keep the queue fair and predictable; the UI should never suggest the owner is hand-picking when the queue decides.
4. Destructive or binding actions (cancel, decline, deactivate) get a clear confirmation, never a silent click.
5. Plain words over jargon; both users are busy, not technical.

## Accessibility & Inclusion

Target WCAG 2.1 AA across owner and worker pages, including colour contrast, readable text sizes on phones, keyboard use and screen-reader labels.
