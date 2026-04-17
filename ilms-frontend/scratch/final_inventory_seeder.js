const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function seed() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        console.log('--- Fetching Valid Parents ---');
        const matsRes = await client.query("SELECT code FROM public.materials");
        const matCodes = matsRes.rows.map(r => r.code);
        
        const locsRes = await client.query("SELECT id FROM public.locations LIMIT 5");
        const locIds = locsRes.rows.map(r => r.id);

        console.log('--- Cleaning Inventory ---');
        await client.query('DELETE FROM public.inventory');

        // VALID STATUSES: PRE_INVENTORY, REGISTERED, ACTIVE, PACKED, SHIPPED, DELIVERED, CONSUMED, RETURNED, SCRAPPED
        const statuses = ['ACTIVE', 'REGISTERED', 'PACKED'];

        console.log('--- Seeding Inventory (25 items) ---');
        
        let snCounter = 9500;
        for (let i = 0; i < 25; i++) {
            const matCode = matCodes[i % matCodes.length];
            const locId = locIds[i % locIds.length];
            const status = statuses[i % statuses.length];
            const sn = `SN-LSC-${snCounter++}`;
            const batch = `BT-2024-${Math.floor(i/5) + 1}`;
            
            await client.query(
                `INSERT INTO public.inventory 
                (material_code, serial_number, batch_number, status, quality_status, location_id, label_printed) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [matCode, sn, batch, status, 'PASS', locId, 'N']
            );
            console.log(`Seeded: ${sn}`);
        }

        console.log('\n--- Seeding Dashboard Metrics ---');
        await client.query('DELETE FROM public.dashboard_metrics');
        await client.query(`
            INSERT INTO public.dashboard_metrics (name, value, unit, category) VALUES 
            ('Total Inventory Items', 3500, 'Units', 'OVERVIEW'),
            ('QC Pass Rate', 99, '%', 'QUALITY'),
            ('Operational Capacity', 85, '%', 'OPERATIONS'),
            ('Priority Alerts', 2, 'Items', 'ALERTS')
        `);

        console.log('\nALL DATA SEEDED SUCCESSFULLY');
    } catch (e) {
        console.error('Error during seeding:', e.message);
    } finally {
        await client.end();
    }
}

seed();
