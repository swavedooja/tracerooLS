const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Swaved00j%40123@db.dmrrxnxwkibwegsmcjsz.supabase.co:5432/postgres';

async function setupOrders() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create Tables
        console.log('Creating tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.sales_orders (
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                order_number character varying NOT NULL UNIQUE,
                customer_name character varying NOT NULL,
                order_date timestamp with time zone DEFAULT now(),
                status character varying DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISPATCHED', 'CANCELLED')),
                total_amount numeric,
                shipping_address text
            );

            CREATE TABLE IF NOT EXISTS public.sales_order_lines (
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                order_id bigint REFERENCES public.sales_orders(id) ON DELETE CASCADE,
                material_code character varying NOT NULL,
                quantity integer NOT NULL,
                uom character varying DEFAULT 'EA'
            );
        `);

        // 2. Clear Existing Orders for seeding
        await client.query('DELETE FROM public.sales_order_lines');
        await client.query('DELETE FROM public.sales_orders');

        // 3. Seed Orders
        console.log('Seeding orders...');
        const orders = [
            { num: 'SO-PHAR-1001', cust: 'Global Health Alliance', addr: 'Bldg 45, Healthcare Park, Geneva' },
            { num: 'SO-VACC-2024', cust: 'UNICEF Supply Division', addr: 'Ocean Port Warehouse 08, Copenhagen' },
            { num: 'SO-EMER-552', cust: 'Red Cross Logistics', addr: 'Relief Hub Alpha, Nairobi' }
        ];

        for (const o of orders) {
            const res = await client.query(
                'INSERT INTO public.sales_orders (order_number, customer_name, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING id',
                [o.num, o.cust, o.addr, 'PENDING']
            );
            const orderId = res.rows[0].id;

            // Seed lines based on realistic pharma items
            if (o.num.includes('PHAR')) {
                await client.query('INSERT INTO public.sales_order_lines (order_id, material_code, quantity, uom) VALUES ($1, $2, $3, $4)', [orderId, 'TAB-AM-250MG', 500, 'EA']);
                await client.query('INSERT INTO public.sales_order_lines (order_id, material_code, quantity, uom) VALUES ($1, $2, $3, $4)', [orderId, 'SYR-PC-100ML', 200, 'EA']);
            } else if (o.num.includes('VACC')) {
                await client.query('INSERT INTO public.sales_order_lines (order_id, material_code, quantity, uom) VALUES ($1, $2, $3, $4)', [orderId, 'VIAL-VC-10ML', 1200, 'EA']);
            } else {
                await client.query('INSERT INTO public.sales_order_lines (order_id, material_code, quantity, uom) VALUES ($1, $2, $3, $4)', [orderId, 'TAB-AM-250MG', 1000, 'EA']);
            }
        }

        console.log('Database setup and seeding completed successfully!');
    } catch (e) {
        console.error('Error during database setup:', e);
    } finally {
        await client.end();
    }
}

setupOrders();
