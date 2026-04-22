const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function applyRepair() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    const sqlPath = path.join(__dirname, 'repair_schema_v2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing repairing SQL...');
    await client.query(sql);
    
    console.log('Supabase repair completed successfully!');
    console.log('1. Added inventory_material_code_fkey');
    console.log('2. Restored get_item_timeline RPC');
    console.log('3. Restored get_item_hierarchy RPC');
    
  } catch (error) {
    console.error('Error applying repair:', error);
  } finally {
    await client.end();
  }
}

applyRepair();
