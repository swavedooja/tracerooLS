const fs = require('fs');
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function runSchema() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Read the schema file
    const schemaSql = fs.readFileSync('ilms_lifescience_schema.sql', 'utf8');
    
    console.log('Executing schema script...');
    await client.query(schemaSql);
    
    console.log('Schema setup completed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await client.end();
  }
}

runSchema();
