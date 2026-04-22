-- Repair ambiguous relationships and missing RPCs
-- Fixes "Multiple Choices" error for locations join

-- 1) Add missing Foreign Key for Materials
-- Ensures inventory.material_code links to materials.code
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_material_code_fkey') THEN
        ALTER TABLE public.inventory 
        ADD CONSTRAINT inventory_material_code_fkey 
        FOREIGN KEY (material_code) REFERENCES public.materials(code);
    END IF;
END $$;

-- 2) Restore get_item_timeline RPC
CREATE OR REPLACE FUNCTION public.get_item_timeline(p_serial_number text)
RETURNS SETOF public.trace_event AS $$
BEGIN
    RETURN QUERY
    SELECT te.*
    FROM public.trace_event te
    JOIN public.inventory i ON te.inventory_id = i.id
    WHERE i.serial_number = p_serial_number
    ORDER BY te.event_time DESC;
END;
$$ LANGUAGE plpgsql;

-- 3) Restore get_item_hierarchy RPC
CREATE OR REPLACE FUNCTION public.get_item_hierarchy(p_serial_number text)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    -- Simplified hierarchy for now: Item and its immediate container
    SELECT jsonb_build_object(
        'item', i.*,
        'material', m.*,
        'container', c.*
    ) INTO result
    FROM public.inventory i
    LEFT JOIN public.materials m ON i.material_code = m.code
    LEFT JOIN public.container_unit c ON i.parent_container_id = c.id
    WHERE i.serial_number = p_serial_number;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
