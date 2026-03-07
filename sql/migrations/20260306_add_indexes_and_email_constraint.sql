-- Performance indexes and email uniqueness for safe UPSERTs
-- Idempotent migration

-- Users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
ON public.users(email);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at
ON public.subscriptions(updated_at);
