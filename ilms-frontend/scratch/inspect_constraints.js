const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function inspectAndFix() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Inspecting Constraints ---');
        const res = await client.query(`
            SELECT pg_get_constraintdef(c.oid) 
            FROM pg_constraint c 
            JOIN pg_class t ON t.oid = c.conrelid 
            WHERE t.relname = 'inventory' 
            AND c.contype = 'c'
        `);
        res.rows.forEach(r => console.log(r.pg_get_constraintdef));

        // Let's assume the statuses are likely 'AVAILABLE', 'ALLOCATED', 'IN_TRANSIT', 'DISPATCHED' etc.
        // I'll update the seeder data in complete_repair.js to use 'IN_STOCK' and 'AVAILABLE' if they match.
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

inspectAndFix();
