const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function inspect() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        console.log('--- Columns ---');
        const cols = await client.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'inventory'");
        console.log(cols.rows);

        console.log('\n--- Constraints ---');
        const cons = await client.query("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.inventory'::regclass");
        console.log(cons.rows);

        console.log('\n--- Materials ---');
        const mats = await client.query("SELECT id, code, name FROM public.materials LIMIT 10");
        console.log(mats.rows);

        console.log('\n--- Locations ---');
        const locs = await client.query("SELECT id, name FROM public.locations LIMIT 10");
        console.log(locs.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

inspect();
