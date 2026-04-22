const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function applyFix() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    const sqlPath = path.join(__dirname, 'fix_supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL fixes...');
    await client.query(sql);
    
    console.log('Supabase schema fixed successfully!');
    console.log('1. Created/Updated view: dashboard_metrics');
    console.log('2. Created/Updated view: dashboard_alerts');
    console.log('3. Created/Updated function: get_inventory_by_stage');
    console.log('4. Verified foreign keys for trace_event');
    
  } catch (error) {
    console.error('Error applying DB fix:', error);
  } finally {
    await client.end();
  }
}

applyFix();
