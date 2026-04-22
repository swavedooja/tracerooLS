const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function addColumn() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    const sqlPath = path.join(__dirname, 'add_images_column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    
    console.log('Column "images" added to materials table successfully!');
    
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await client.end();
  }
}

addColumn();
