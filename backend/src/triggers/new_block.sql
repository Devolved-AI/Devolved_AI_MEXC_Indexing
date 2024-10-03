-- Ensure the function does not already exist
DROP FUNCTION IF EXISTS public.notify_block_change();

-- Re-create the function
CREATE OR REPLACE FUNCTION public.notify_block_change()
RETURNS trigger
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
  payload JSON;
BEGIN
  -- Only create a payload if NEW is not null (useful for DELETE operations)
  IF NEW IS NOT NULL THEN
    payload = json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW)
    );
    -- Notify the application with the channel and the payload
    PERFORM pg_notify('block_change', payload::text);
  END IF;
  RETURN NEW;
END;
$BODY$;

-- Update the function's owner if necessary
ALTER FUNCTION public.notify_block_change()
    OWNER TO mindhunter;

-- Create or replace the trigger using the newly defined function
DROP TRIGGER IF EXISTS block_change_trigger ON blocks;
CREATE TRIGGER block_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON blocks
FOR EACH ROW EXECUTE FUNCTION notify_block_change();
