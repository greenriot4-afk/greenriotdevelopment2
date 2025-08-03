-- Add unique constraint on user_id for connected_accounts table
ALTER TABLE connected_accounts ADD CONSTRAINT connected_accounts_user_id_unique UNIQUE (user_id);