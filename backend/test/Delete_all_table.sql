DO $$
DECLARE
    r RECORD;
BEGIN
    -- Disable foreign key checks to prevent dependency errors
    SET session_replication_role = 'replica';

    -- Loop through all tables in the public schema
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        -- Execute drop table command for each table found
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Re-enable foreign key checks
    SET session_replication_role = 'origin';
END $$;
