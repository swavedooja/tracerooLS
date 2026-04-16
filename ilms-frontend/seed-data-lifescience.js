const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

const data = {
  locations: [
    { id: '11111111-1111-1111-1111-111111111111', code: 'MFG-01', name: 'Manufacturing Plant 01', type: 'PLANT', status: 'ACTIVE' },
    { id: '22222222-2222-2222-2222-222222222222', code: 'WHS-FG', name: 'Finished Goods Warehouse', type: 'WAREHOUSE', status: 'ACTIVE' },
    { id: '33333333-3333-3333-3333-333333333333', code: 'WHS-Q', name: 'Quarantine Zone', type: 'QUARANTINE', is_quarantine: true, status: 'ACTIVE' }
  ],
  definitions: [
    { id: 'd0000000-0000-0000-0000-000000000001', def_type: 'MATERIAL_TYPE', def_value: 'TABLETS', description: 'Oral Tablets' },
    { id: 'd0000000-0000-0000-0000-000000000002', def_type: 'MATERIAL_TYPE', def_value: 'SYRUP', description: 'Liquid Syrups' },
    { id: 'd0000000-0000-0000-0000-000000000003', def_type: 'MATERIAL_TYPE', def_value: 'CAPSULES', description: 'Oral Capsules' },
    { id: 'd0000000-0000-0000-0000-000000000004', def_type: 'MATERIAL_CAT', def_value: 'PAIN_RELIEF_500MG', description: 'Pain Relief 500mg' },
    { id: 'd0000000-0000-0000-0000-000000000005', def_type: 'MATERIAL_CAT', def_value: 'COUGH_REC', description: 'Cough Recovery' },
    { id: 'd0000000-0000-0000-0000-000000000006', def_type: 'MATERIAL_CAT', def_value: 'ANTIBIOTIC_250MG', description: 'Antibiotic 250mg' }
  ],
  materials: [
    {
      id: 'e1111111-e89b-12d3-a456-426614174000',
      code: 'TAB-PR-500MG',
      name: 'General Pain Relief Tablets 500mg',
      description: 'Standard pain relief tablets, 10 per blister',
      type: 'TABLETS',
      category: 'PAIN_RELIEF_500MG',
      base_uom: 'BTR', // Blister
      is_serial_managed: true,
      shelf_life_days: 730,
      packaging_hierarchy_id: null // Set to reference below
    },
    {
      id: 'e2222222-e89b-12d3-a456-426614174000',
      code: 'SYR-CO-100ML',
      name: 'Adult Cough Syrup 100ml',
      description: 'Cough syrup bottle, 100ml',
      type: 'SYRUP',
      category: 'COUGH_REC',
      base_uom: 'BTL', // Bottle
      is_serial_managed: true,
      shelf_life_days: 365
    },
    {
      id: 'e3333333-e89b-12d3-a456-426614174000',
      code: 'CAP-AN-250MG',
      name: 'Standard Antibiotic Capsules 250mg',
      description: 'Antibiotic course, 20 capsules',
      type: 'CAPSULES',
      category: 'ANTIBIOTIC_250MG',
      base_uom: 'BTR', // Blister
      is_serial_managed: true,
      shelf_life_days: 730
    }
  ],
  hierarchy: {
    id: 'a1111111-e89b-12d3-a456-426614174000',
    name: 'Standard Blister Packaging',
    description: 'Blister Pack -> Small Box (10) -> Master Carton (50) -> Pallet'
  },
  levels: [
    { id: '10000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 1, level_name: 'Blister Pack', contained_quantity: 1 },
    { id: '20000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 2, level_name: 'Small Box', contained_quantity: 10 },
    { id: '30000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 3, level_name: 'Master Carton', contained_quantity: 50 },
    { id: '40000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 4, level_name: 'Pallet', contained_quantity: 20 }
  ]
};

async function seedData() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Clear old data
    console.log('Cleaning up existing data...');
    await client.query("DELETE FROM public.packaging_level");
    await client.query("DELETE FROM public.packaging_hierarchy");
    await client.query("DELETE FROM public.inventory");
    await client.query("DELETE FROM public.materials");
    await client.query("DELETE FROM public.master_definitions");
    await client.query("DELETE FROM public.locations");
    
    // Insert Locations
    console.log('Seeding Locations...');
    for (const loc of data.locations) {
      await client.query(`INSERT INTO public.locations (id, code, name, type, status) VALUES ($1, $2, $3, $4, $5)`, 
      [loc.id, loc.code, loc.name, loc.type, loc.status]);
    }
    
    // Insert Definitions
    console.log('Seeding Master Definitions...');
    for (const def of data.definitions) {
      await client.query(`INSERT INTO public.master_definitions (id, def_type, def_value, description) VALUES ($1, $2, $3, $4)`, 
      [def.id, def.def_type, def.def_value, def.description]);
    }

    // Insert Hierarchy
    console.log('Seeding Packaging Hierarchy...');
    await client.query(`INSERT INTO public.packaging_hierarchy (id, name, description) VALUES ($1, $2, $3)`, 
    [data.hierarchy.id, data.hierarchy.name, data.hierarchy.description]);

    // Insert Levels
    for (const lvl of data.levels) {
      await client.query(`INSERT INTO public.packaging_level (id, hierarchy_id, level_order, level_name, contained_quantity) VALUES ($1, $2, $3, $4, $5)`, 
      [lvl.id, lvl.hierarchy_id, lvl.level_order, lvl.level_name, lvl.contained_quantity]);
    }

    // Insert Materials
    console.log('Seeding Materials...');
    for (const mat of data.materials) {
      await client.query(`INSERT INTO public.materials (id, code, name, description, type, category, base_uom, is_serial_managed, shelf_life_days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
      [mat.id, mat.code, mat.name, mat.description, mat.type, mat.category, mat.base_uom, mat.is_serial_managed, mat.shelf_life_days]);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

seedData();
