const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function updateSchema() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    console.log('Adding label_printed column to inventory table...');
    await client.query(`
      ALTER TABLE public.inventory 
      ADD COLUMN IF NOT EXISTS label_printed CHAR(1) DEFAULT 'N' 
      CHECK (label_printed IN ('Y', 'N'));
    `);
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.end();
  }
}

updateSchema();
