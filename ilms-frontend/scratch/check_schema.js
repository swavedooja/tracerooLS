const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function schema() {
    const client = new Client({ connectionString });
    await client.connect();
    const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'materials'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
schema();
