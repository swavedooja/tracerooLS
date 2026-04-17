const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function fixTypes() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Fixing Inventory Location Types ---');
        
        // Remove existing foreign keys first to allow type change
        await client.query(`
            ALTER TABLE IF EXISTS public.inventory DROP CONSTRAINT IF EXISTS inventory_location_id_fkey;
            ALTER TABLE IF EXISTS public.inventory DROP CONSTRAINT IF EXISTS inventory_scan_location_id_fkey;
            
            ALTER TABLE public.inventory ALTER COLUMN location_id TYPE uuid USING location_id::text::uuid;
            ALTER TABLE public.inventory ALTER COLUMN scan_location_id TYPE uuid USING scan_location_id::text::uuid;
            
            ALTER TABLE public.inventory ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
            ALTER TABLE public.inventory ADD CONSTRAINT inventory_scan_location_id_fkey FOREIGN KEY (scan_location_id) REFERENCES public.locations(id);
        `);
        
        console.log('Schema fixed successfully');
    } catch (e) {
        console.error('Error fixing types:', e.message);
    } finally {
        await client.end();
    }
}

fixTypes();
