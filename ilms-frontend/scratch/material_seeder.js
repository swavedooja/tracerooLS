const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function seed() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Adding Missing Columns ---');
        try {
            await client.query('ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS procurement_type TEXT');
            await client.query('ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS vehicle_type TEXT');
            console.log('Columns added or already exist.');
        } catch (e) {
            console.log('Note: Could not add columns (might already exist or lack permission):', e.message);
        }

        console.log('--- Seeding Material Data ---');
        
        const materials = [
            {
                code: 'TAB-AM-250MG',
                data: {
                    description: 'High-purity Amoxicillin 250mg tablets for bacterial infections.',
                    country_of_origin: 'Germany',
                    state: 'Solid',
                    class: 'Cartons',
                    storage_type: 'Ambient',
                    procurement_type: 'Make To Stock',
                    vehicle_type: 'Standard Container',
                    ean: '4001234567890',
                    upc: '123456789012',
                    net_weight: 0.5,
                    gross_weight: 0.6,
                    weight_uom: 'KG',
                    length: 120,
                    width: 80,
                    height: 50,
                    dimension_uom: 'MM',
                    is_packaged: true,
                    is_fragile: false,
                    is_high_value: true,
                    is_env_sensitive: false,
                    is_batch_managed: true,
                    is_serial_managed: true,
                    shelf_life_days: 730
                },
                hp: {
                    temperature_min: 15,
                    temperature_max: 25,
                    humidity_min: 30,
                    humidity_max: 60,
                    hazardous_class: 'None',
                    epc_format: 'SGTIN-96',
                    env_parameters: 'Dry and Dark',
                    precautions: 'Keep out of reach of children.'
                }
            },
            {
                code: 'VIAL-VC-10ML',
                data: {
                    description: 'mRNA-based COVID-19 vaccine for immunization programs.',
                    country_of_origin: 'USA',
                    state: 'Liquid',
                    class: 'Vials',
                    storage_type: 'Cold Storage',
                    procurement_type: 'Purchase',
                    vehicle_type: 'Refrigerated Truck',
                    ean: '0881234567891',
                    upc: '881234567891',
                    net_weight: 0.05,
                    gross_weight: 0.08,
                    weight_uom: 'KG',
                    length: 45,
                    width: 45,
                    height: 70,
                    dimension_uom: 'MM',
                    is_packaged: true,
                    is_fragile: true,
                    is_high_value: true,
                    is_env_sensitive: true,
                    is_batch_managed: true,
                    is_serial_managed: true,
                    shelf_life_days: 180
                },
                hp: {
                    temperature_min: -80,
                    temperature_max: -60,
                    humidity_min: 0,
                    humidity_max: 100,
                    hazardous_class: 'Biological',
                    epc_format: 'SGTIN-96',
                    env_parameters: 'Ultra-low temperature',
                    precautions: 'Do not refreeze once thawed.'
                }
            },
            {
                code: 'SYR-PC-100ML',
                data: {
                    description: 'Paracetamol 100ml syrup for pain and fever relief in children.',
                    country_of_origin: 'India',
                    state: 'Liquid',
                    class: 'Bottles',
                    storage_type: 'Ambient',
                    procurement_type: 'Make To Stock',
                    vehicle_type: 'Standard Container',
                    ean: '8901234567892',
                    upc: '123456789033',
                    net_weight: 0.15,
                    gross_weight: 0.2,
                    weight_uom: 'KG',
                    length: 60,
                    width: 60,
                    height: 150,
                    dimension_uom: 'MM',
                    is_packaged: true,
                    is_fragile: true,
                    is_high_value: false,
                    is_env_sensitive: false,
                    is_batch_managed: true,
                    is_serial_managed: true,
                    shelf_life_days: 1095
                },
                hp: {
                    temperature_min: 10,
                    temperature_max: 30,
                    humidity_min: 20,
                    humidity_max: 80,
                    hazardous_class: 'None',
                    epc_format: 'SGTIN-96',
                    env_parameters: 'Shake well before use',
                    precautions: 'Avoid direct sunlight.'
                }
            }
        ];

        for (const m of materials) {
            console.log(`Updating ${m.code}...`);
            // Update materials table
            const fields = Object.keys(m.data);
            const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
            const values = fields.map(f => m.data[f]);
            await client.query(`UPDATE public.materials SET ${setClause} WHERE code = $1`, [m.code, ...values]);

            // Update/Insert handling_parameter table
            await client.query('DELETE FROM public.handling_parameter WHERE material_code = $1', [m.code]);
            const hpFields = Object.keys(m.hp);
            const hpColumns = ['material_code', ...hpFields].join(', ');
            const hpPlaceholders = ['material_code', ...hpFields].map((_, i) => `$${i + 1}`).join(', ');
            const hpValues = [m.code, ...hpFields.map(f => m.hp[f])];
            await client.query(`INSERT INTO public.handling_parameter (${hpColumns}) VALUES (${hpPlaceholders})`, hpValues);
        }

        console.log('SEEDING COMPLETE');
    } catch (e) {
        console.error('Error seeding:', e.message);
    } finally {
        await client.end();
    }
}

seed();
