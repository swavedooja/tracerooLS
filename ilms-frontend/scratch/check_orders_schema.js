const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function checkSchema() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected');

        // Check for tables that link orders to items
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name ILIKE '%order%' OR table_name ILIKE '%fulfill%' OR table_name ILIKE '%item%')
        `);
        console.log('Relevant tables:', res.rows.map(r => r.table_name).join(', '));

        // Check columns of sales_order_lines
        const sol = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sales_order_lines'
        `);
        console.log('sales_order_lines columns:', sol.rows.map(r => r.column_name).join(', '));
        
        // Check for shipment tables
        const ship = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name ILIKE '%shipment%'
        `);
        console.log('Shipment tables:', ship.rows.map(r => r.table_name).join(', '));

        // Check for trace_event columns
        const trace = await client.query(`
             SELECT column_name 
             FROM information_schema.columns 
             WHERE table_name = 'trace_event'
        `);
        console.log('trace_event columns:', trace.rows.map(r => r.column_name).join(', '));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
checkSchema();
