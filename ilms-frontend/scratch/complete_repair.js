const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function runRepair() {
    // 1. Move Images
    console.log('--- Moving Images ---');
    const srcDir = path.join(process.cwd(), 'assets', 'products');
    const destDir = path.join(process.cwd(), 'public', 'assets', 'products');

    if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            console.log(`Copied ${file} to public/assets/products`);
        }
    } else {
        console.warn('assets/products not found');
    }

    // 2. Database Repairs
    console.log('\n--- Database Repairs ---');
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        // Add FKs to trace_event
        console.log('Adding constraints for trace_event...');
        await client.query(`
            ALTER TABLE IF EXISTS public.trace_event DROP CONSTRAINT IF EXISTS fk_trace_event_inventory;
            ALTER TABLE IF EXISTS public.trace_event DROP CONSTRAINT IF EXISTS fk_trace_event_container;
            
            ALTER TABLE public.trace_event ADD CONSTRAINT fk_trace_event_inventory FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);
            ALTER TABLE public.trace_event ADD CONSTRAINT fk_trace_event_container FOREIGN KEY (container_id) REFERENCES public.container_unit(id);
        `);

        // Create Dashboard Tables
        console.log('Creating dashboard tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name text NOT NULL,
                value numeric DEFAULT 0,
                unit text,
                category text,
                updated_at timestamp with time zone DEFAULT now()
            );
            
            CREATE TABLE IF NOT EXISTS public.dashboard_alerts (
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                severity text NOT NULL,
                message text NOT NULL,
                category text,
                is_resolved boolean DEFAULT false,
                created_at timestamp with time zone DEFAULT now()
            );
        `);

        // Create RPC Function
        console.log('Creating RPC function get_inventory_by_stage...');
        await client.query(`
            CREATE OR REPLACE FUNCTION public.get_inventory_by_stage()
            RETURNS TABLE(stage text, count bigint) AS $$
            BEGIN
                RETURN QUERY
                SELECT status as stage, count(*) as count
                FROM public.inventory
                GROUP BY status;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Seed Inventory & Metrics
        console.log('Seeding inventory and metrics...');
        
        // Clear old inventory to avoid duplicates if re-seeding
        await client.query('DELETE FROM public.trace_event');
        await client.query('DELETE FROM public.inventory');
        
        // Insert Seed Inventory
        const inventoryItems = [
            { code: 'TAB-AM-250MG', sn: 'SN-AMOX-001', batch: 'B123', status: 'IN_STOCK', quality: 'PASS' },
            { code: 'TAB-AM-250MG', sn: 'SN-AMOX-002', batch: 'B123', status: 'IN_STOCK', quality: 'PASS' },
            { code: 'VIAL-VC-10ML', sn: 'SN-VACC-001', batch: 'V999', status: 'AVAILABLE', quality: 'PASS' },
            { code: 'SYR-PC-100ML', sn: 'SN-PARA-001', batch: 'P456', status: 'IN_TRANSIT', quality: 'PASS' }
        ];

        for (const item of inventoryItems) {
            await client.query(
                'INSERT INTO public.inventory (material_code, serial_number, batch_number, status, quality_status, label_printed) VALUES ($1, $2, $3, $4, $5, $6)',
                [item.code, item.sn, item.batch, item.status, item.quality, 'N']
            );
        }

        // Seed Metrics
        await client.query('DELETE FROM public.dashboard_metrics');
        await client.query('INSERT INTO public.dashboard_metrics (name, value, unit, category) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)', 
            ['Total Stock', 1500, 'Units', 'OVERVIEW', 'Critical Stocks', 3, 'Items', 'ALERTS']);

        console.log('Repair and seeding completed successfully!');
    } catch (e) {
        console.error('Error during database repair:', e.message);
    } finally {
        await client.end();
    }
}

runRepair();
