const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function finalFix() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected');
        
        // 1. Safe add unique constraint
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'materials_code_key') THEN 
                    ALTER TABLE public.materials ADD CONSTRAINT materials_code_key UNIQUE (code);
                END IF; 
            END $$;
        `);
        console.log('Unique constraint check done');
        
        // 2. Safe fix FK
        await client.query(`
            ALTER TABLE IF EXISTS public.sales_order_lines DROP CONSTRAINT IF EXISTS fk_sales_order_lines_materials;
            ALTER TABLE public.sales_order_lines ADD CONSTRAINT fk_sales_order_lines_materials FOREIGN KEY (material_code) REFERENCES materials(code);
        `);
        console.log('FK Fixed');
        
        // 3. Notify reload
        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log('Reload Notified');
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

finalFix();
