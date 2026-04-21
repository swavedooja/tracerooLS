const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function seedHierarchies() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected');

        // Cleanup Hierarchies
        await client.query('DELETE FROM public.packaging_level');
        await client.query('DELETE FROM public.packaging_hierarchy');

        const hierarchies = [
            { name: 'Amoxicillin Tablets - Global Export Pack', material: 'TAB-AM-250MG' },
            { name: 'Insulin Glargine - Standard Cold Chain', material: 'SYR-PC-100ML' },
            { name: 'mRNA Vaccine - Ultra-Low Temp Shipper', material: 'VIAL-VC-10ML' }
        ];

        for (const h of hierarchies) {
            const res = await client.query(
                'INSERT INTO public.packaging_hierarchy (name, description) VALUES ($1, $2) RETURNING id',
                [h.name, `Standard shipping hierarchy for ${h.material}`]
            );
            const hid = res.rows[0].id;

            // Define specific labels based on material
            let unitName = 'Selling Unit';
            if (h.material === 'TAB-AM-250MG') unitName = 'Amoxicillin Tablet Strip';
            if (h.material === 'SYR-PC-100ML') unitName = 'Insulin Glargine Cartridge';
            if (h.material === 'VIAL-VC-10ML') unitName = 'mRNA Vaccine Vial';

            // Levels: Unit Name -> Carton -> Shipper
            await client.query('INSERT INTO public.packaging_level (hierarchy_id, level_order, level_name, contained_quantity) VALUES ($1, $2, $3, $4)', [hid, 1, unitName, 1]);
            await client.query('INSERT INTO public.packaging_level (hierarchy_id, level_order, level_name, contained_quantity) VALUES ($1, $2, $3, $4)', [hid, 2, 'Standard Carton', 50]);
            await client.query('INSERT INTO public.packaging_level (hierarchy_id, level_order, level_name, contained_quantity) VALUES ($1, $2, $3, $4)', [hid, 3, 'Master Shipper', 500]);
        }

        console.log('Hierarchies seeded successfully');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

seedHierarchies();
