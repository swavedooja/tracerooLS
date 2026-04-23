const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://dmrrxnxwkibwegsmcjsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcnJ4bnh3a2lid2Vnc21janN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2MTkxNjAsImV4cCI6MjAyODIwMjA0MCwiYXVkIjoiYW5vbiJ9.M53qSjPsH_9-2j4z79-2j4z79-2j4z79-2j4z79-2j4'; // Wait, the key in supabaseClient.js was slightly different? No, let me re-read.
// Ah, the key in supabaseClient.js was 'sb_publishable_mksAzd1TfeDxGpdQvnegFQ_M53qSjPs'. That doesn't look like a standard JWT.
// Let me check the connection string in final_inventory_seeder.js.
// postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres

async function list() {
    const { Client } = require('pg');
    const client = new Client({ connectionString: 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres' });
    await client.connect();
    const res = await client.query('SELECT * FROM public.materials');
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
list();
