CREATE OR REPLACE FUNCTION notify_transaction_change() RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    -- If DELETE operation, notify with the OLD record
    payload = json_build_object(
      'operation', TG_OP,
      'record', row_to_json(OLD)
    );
  ELSE
    -- If INSERT or UPDATE operation, notify with the NEW record
    payload = json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW)
    );
  END IF;

  -- Notify the application with the channel 'transaction_change' and the payload
  PERFORM pg_notify('transaction_change', payload::text);
  
  -- Return the appropriate row for INSERT/UPDATE, NULL for DELETE
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger creation
CREATE TRIGGER transaction_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION notify_transaction_change();
