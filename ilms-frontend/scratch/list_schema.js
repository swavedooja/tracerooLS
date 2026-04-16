const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function listSchema() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- TABLES ---');
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log(tables.join(', '));

        for (const table of tables) {
            console.log(`\n--- COLUMNS for ${table} ---`);
            const colRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(colRes.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

listSchema();
