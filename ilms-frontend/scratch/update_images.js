const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function updateImages() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected');

        const updates = [
            { code: 'TAB-AM-250MG', url: '/assets/products/amoxycillin.png', file: 'amoxycillin.png' },
            { code: 'VIAL-VC-10ML', url: '/assets/products/vaccine.png', file: 'vaccine.png' },
            { code: 'SYR-PC-100ML', url: '/assets/products/paracetamol.png', file: 'paracetamol.png' }
        ];

        for (const u of updates) {
            await client.query('DELETE FROM public.material_image WHERE material_code = $1', [u.code]);
            await client.query(
                'INSERT INTO public.material_image (material_code, url, type, filename) VALUES ($1, $2, $3, $4)',
                [u.code, u.url, 'MAIN', u.file]
            );
            console.log(`Updated ${u.code}`);
        }

        console.log('All material images updated successfully');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

updateImages();
