const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

const data = {
  locations: [
    // Root Level
    { id: '11111111-1111-1111-1111-111111111111', code: 'SITE-SM-01', name: 'Strategic Pharma Mfg Site', type: 'PLANT', parent_id: null },
    { id: '22222222-2222-2222-2222-222222222222', code: 'HUB-CC-01', name: 'Cold Chain Distribution Hub', type: 'WAREHOUSE', parent_id: null },
    
    // Site-SM-01 Children
    { id: '11111111-2222-1111-1111-111111111111', code: 'LINE-01', name: 'High-Speed Tablet Line 01', type: 'LINE', parent_id: '11111111-1111-1111-1111-111111111111' },
    { id: '11111111-3333-1111-1111-111111111111', code: 'PKG-01', name: 'Sterile Packaging Zone', type: 'ROOM', parent_id: '11111111-2222-1111-1111-111111111111' },
    { id: '11111111-4444-1111-1111-111111111111', code: 'SITE-QC', name: 'Central Quality Control Lab', type: 'LAB', parent_id: '11111111-1111-1111-1111-111111111111' },
    
    // Hub-CC-01 Children
    { id: '22222222-3333-2222-2222-222222222222', code: 'FRZ-A', name: 'Ultra-Low Temp Freezer Unit A', type: 'STORAGE', is_quarantine: false, parent_id: '22222222-2222-2222-2222-222222222222' },
    { id: '22222222-4444-2222-2222-222222222222', code: 'HUB-Q', name: 'Pharma Quarantine Zone', type: 'QUARANTINE', is_quarantine: true, parent_id: '22222222-2222-2222-2222-222222222222' }
  ],
  definitions: [
    { id: 'd0000000-0000-0000-0000-000000000001', def_type: 'MATERIAL_TYPE', def_value: 'TABLETS', description: 'Oral Tablets' },
    { id: 'd0000000-0000-0000-0000-000000000002', def_type: 'MATERIAL_TYPE', def_value: 'SYRUP', description: 'Liquid Syrups' },
    { id: 'd0000000-0000-0000-0000-000000000003', def_type: 'MATERIAL_TYPE', def_value: 'VIALS', description: 'Glass Vials' },
    { id: 'd0000000-0000-0000-0000-000000000004', def_type: 'MATERIAL_CAT', def_value: 'ANTIBIOTICS', description: 'Antibiotic Spectrum' },
    { id: 'd0000000-0000-0000-0000-000000000005', def_type: 'MATERIAL_CAT', def_value: 'VACCINES', description: 'Immunologicals' },
    { id: 'd0000000-0000-0000-0000-000000000006', def_type: 'MATERIAL_CAT', def_value: 'PAIN_RELIEF', description: 'Analgesics' }
  ],
  materials: [
    {
      id: 'e1111111-e89b-12d3-a456-426614174000',
      code: 'TAB-AM-250MG',
      name: 'Amoxicillin 250mg Tablets',
      description: 'Broad-spectrum antibiotic tablets',
      type: 'TABLETS',
      category: 'ANTIBIOTICS',
      base_uom: 'BTR',
      is_serial_managed: true,
      shelf_life_days: 730
    },
    {
      id: 'e2222222-e89b-12d3-a456-426614174000',
      code: 'VIAL-VC-10ML',
      name: 'COVID-19 Vaccine Vials (10ml)',
      description: 'Multi-dose mRNA vaccine vial',
      type: 'VIALS',
      category: 'VACCINES',
      base_uom: 'VIAL',
      is_serial_managed: true,
      shelf_life_days: 180
    },
    {
      id: 'e3333333-e89b-12d3-a456-426614174000',
      code: 'SYR-PC-100ML',
      name: 'Paracetamol Syrup (100ml)',
      description: 'Analgesic and antipyretic liquid',
      type: 'SYRUP',
      category: 'PAIN_RELIEF',
      base_uom: 'BTL',
      is_serial_managed: true,
      shelf_life_days: 730
    }
  ],
  hierarchy: {
    id: 'a1111111-e89b-12d3-a456-426614174000',
    name: 'Standard Pharma Blister Flow',
    description: 'Blister -> Small Box (10) -> Master Carton (50) -> Pallet'
  },
  levels: [
    { id: '10000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 1, level_name: 'Blister', contained_quantity: 1, shapeType: 'Base' },
    { id: '20000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 2, level_name: 'Small Box', contained_quantity: 10, shapeType: 'Box' },
    { id: '30000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 3, level_name: 'Master Carton', contained_quantity: 50, shapeType: 'Carton' },
    { id: '40000000-e89b-12d3-a456-426614174000', hierarchy_id: 'a1111111-e89b-12d3-a456-426614174000', level_order: 4, level_name: 'Pallet', contained_quantity: 20, shapeType: 'Pallet' }
  ]
};

async function seedData() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Clear old data
    console.log('Cleaning up existing data...');
    await client.query("DELETE FROM public.aggregation");
    await client.query("DELETE FROM public.trace_event");
    await client.query("DELETE FROM public.container_unit");
    await client.query("DELETE FROM public.inventory");
    await client.query("DELETE FROM public.packaging_level");
    await client.query("DELETE FROM public.packaging_hierarchy");
    await client.query("DELETE FROM public.materials");
    await client.query("DELETE FROM public.master_definitions");
    await client.query("DELETE FROM public.locations");
    
    // Insert Locations (Ordered to handle parent_id)
    console.log('Seeding Locations...');
    // Roots
    const roots = data.locations.filter(l => !l.parent_id);
    const children = data.locations.filter(l => l.parent_id);
    
    for (const loc of roots) {
      await client.query(`INSERT INTO public.locations (id, code, name, type, parent_id, status) VALUES ($1, $2, $3, $4, $5, $6)`, 
      [loc.id, loc.code, loc.name, loc.type, null, 'ACTIVE']);
    }
    for (const loc of children) {
      await client.query(`INSERT INTO public.locations (id, code, name, type, parent_id, status) VALUES ($1, $2, $3, $4, $5, $6)`, 
      [loc.id, loc.code, loc.name, loc.type, loc.parent_id, 'ACTIVE']);
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
      await client.query(`INSERT INTO public.materials (id, code, name, description, type, category, base_uom, is_serial_managed, shelf_life_days, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
      [mat.id, mat.code, mat.name, mat.description, mat.type, mat.category, mat.base_uom, mat.is_serial_managed, mat.shelf_life_days, 'ACTIVE']);
    }

    // Insert Inventory
    console.log('Seeding Inventory...');
    const batches = ['B-1001-24', 'B-1002-24', 'B-2005-24'];
    const statues = ['ACTIVE', 'QUALITY_HOLD', 'SHIPPED'];
    const locations = data.locations.map(l => l.id);

    let invId = 10000;
    for (const mat of data.materials) {
      for (let i = 1; i <= 15; i++) {
        const batch = batches[Math.floor(Math.random() * batches.length)];
        const status = statues[Math.floor(Math.random() * statues.length)];
        const locId = locations[Math.floor(Math.random() * locations.length)];
        const sn = `SN-${mat.code}-${Math.floor(Math.random() * 90000) + 10000}`;
        
        await client.query(`INSERT INTO public.inventory (id, material_code, batch_number, serial_number, status, scan_location_id, quality_status, manufactured_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
        [invId++, mat.code, batch, sn, status === 'SHIPPED' ? 'SHIPPED' : 'ACTIVE', (status === 'SHIPPED' ? null : locId), status === 'QUALITY_HOLD' ? 'HOLD' : 'PASS', new Date().toISOString()]);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

seedData();
