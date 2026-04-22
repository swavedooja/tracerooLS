-- Fix missing objects for Traceroo Dashboard
-- Created to resolve 400/406 errors on Supabase

-- 1) Function for Dashboard Pipeline
DROP FUNCTION IF EXISTS public.get_inventory_by_stage();
CREATE OR REPLACE FUNCTION public.get_inventory_by_stage()
RETURNS TABLE(stage text, count bigint, percentage numeric) AS $$
DECLARE
    total bigint;
BEGIN
    SELECT count(*) INTO total FROM public.inventory;
    IF total = 0 THEN total := 1; END IF;
    
    RETURN QUERY
    SELECT 
        status::text as stage,
        count(*),
        round((count(*) * 100.0 / total), 2) as percentage
    FROM public.inventory
    GROUP BY status;
END;
$$ LANGUAGE plpgsql;

-- 2) View for Executive Metrics
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'dashboard_metrics') THEN
        EXECUTE 'DROP ' || (SELECT CASE WHEN relkind = 'v' THEN 'VIEW' ELSE 'TABLE' END FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'dashboard_metrics') || ' public.dashboard_metrics CASCADE';
    END IF;
END $$;

CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
  (SELECT count(*) FROM public.inventory WHERE status = 'PRE_INVENTORY') as pre_inventory_count,
  (SELECT count(*) FROM public.inventory WHERE status = 'ACTIVE') as active_inventory_count,
  (SELECT count(*) FROM public.inventory WHERE status = 'PACKED') as packed_count,
  (SELECT count(*) FROM public.inventory WHERE status = 'SHIPPED') as shipped_count,
  (SELECT count(*) FROM public.inventory WHERE status = 'DELIVERED') as delivered_count,
  (SELECT count(*) FROM public.inventory) as total_inventory_count,
  (SELECT count(*) FROM public.container_unit WHERE container_type = 'BOX') as box_count,
  (SELECT count(*) FROM public.container_unit WHERE container_type = 'PALLET') as pallet_count,
  (SELECT count(*) FROM public.serial_number_pool WHERE status = 'RESERVED') as reserved_serials,
  (SELECT count(*) FROM public.serial_number_pool WHERE status = 'CONSUMED') as consumed_serials,
  (SELECT count(*) FROM public.container_unit WHERE status = 'SEALED') as sealed_containers,
  (SELECT count(*) FROM public.trace_event WHERE event_time > now() - interval '24 hours') as events_last_24h,
  (SELECT count(*) FROM public.inventory WHERE created_at > now() - interval '24 hours') as items_created_24h;

-- 3) View for Alerts
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'dashboard_alerts') THEN
        EXECUTE 'DROP ' || (SELECT CASE WHEN relkind = 'v' THEN 'VIEW' ELSE 'TABLE' END FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'dashboard_alerts') || ' public.dashboard_alerts CASCADE';
    END IF;
END $$;

CREATE OR REPLACE VIEW public.dashboard_alerts AS
SELECT 
  id,
  event_time as timestamp,
  event_type as severity, 
  notes as description,
  COALESCE(inventory_id::text, batch_number, 'N/A') as reference
FROM public.trace_event
WHERE event_category = 'EXCEPTION'
ORDER BY event_time DESC;

-- 4) Fix Foreign Keys for Joins
DO $$ 
BEGIN
    -- Fix inventory link
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trace_event_inventory_id_fkey') THEN
        ALTER TABLE public.trace_event 
        ADD CONSTRAINT trace_event_inventory_id_fkey 
        FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);
    END IF;

    -- Fix container link
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trace_event_container_id_fkey') THEN
        ALTER TABLE public.trace_event 
        ADD CONSTRAINT trace_event_container_id_fkey 
        FOREIGN KEY (container_id) REFERENCES public.container_unit(id);
    END IF;
END $$;
