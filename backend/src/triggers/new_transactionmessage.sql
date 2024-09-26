CREATE OR REPLACE FUNCTION notify_transactionmessage_change() RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Create a JSON payload with the type of operation and the record affected
  payload = json_build_object(
    'operation', TG_OP,
    'record', row_to_json(NEW)
  );
  -- Notify the application with the table name and the payload
  PERFORM pg_notify('transaction_message_change', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactionmessage_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactionmessages
FOR EACH ROW EXECUTE FUNCTION notify_transactionmessage_change();
