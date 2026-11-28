-- OCH-207: workers must cancel through request_shift_cancellation,
-- which needs owner approval. The old direct-cancel RPC skipped that.
drop function if exists public.cancel_shift_offer(uuid);
drop function if exists private.cancel_shift_offer(uuid);
