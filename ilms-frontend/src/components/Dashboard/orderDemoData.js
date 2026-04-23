/**
 * Order Lifecycle Dashboard - Specialized Pharma Demo Data
 */
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const ORDER_LIFECYCLE_DATA = [
    {
        id: 'SO-PH-001',
        order_number: 'SO-AMOX-2024-001',
        customer_name: 'Global Pharma Distributors Inc.',
        order_date: daysAgo(10),
        status: 'SHIPPED',
        priority: 'HIGH',
        total_value: 12500.00,
        currency: 'USD',
        ship_to_destination: 'Berlin Logistics Hub, Germany',
        ship_to_address: 'Grenzallee 12, 12057 Berlin, Germany',
        tax_code: 'VAT-EU-01',
        customer_po: 'PO-GRP-8821',
        delivery_date: daysAgo(5),
        lines: [
            { id: 'L1', material_code: 'TAB-AM-250MG', material_name: 'Amoxicillin 250mg Tablets', quantity: 500, uom: 'Strips', unit_price: 25.00, total_price: 12500.00, tax_code: 'VAT-EU-19', tax_amount: 2375.00, hsn_code: '300410' }
        ],
        fulfillment: {
            type: 'PALLET',
            serial: 'PLT-AMOX-001',
            status: 'IN_TRANSIT',
            children: Array.from({ length: 5 }, (_, i) => ({
                id: `CS-AM-${i+1}`,
                serial: `CASE-AMOX-100${i+1}`,
                type: 'CASE',
                status: 'IN_TRANSIT',
                children: Array.from({ length: 10 }, (_, j) => ({
                    id: `IT-AM-${i+1}-${j+1}`,
                    serial: `SN-AM-250-00${i*10 + j + 1}`,
                    type: 'UNIT',
                    status: 'SHIPPED',
                    events: [
                        { type: 'MANUFACTURED', time: daysAgo(20), location: 'Strategic Pharma Site - Mumbai', user: 'System', notes: 'Batch B-9982' },
                        { type: 'QC_PASS', time: daysAgo(19), location: 'QC Lab 4', user: 'Analyst Sarah', notes: 'Purity 99.8%' },
                        { type: 'PACKED', time: daysAgo(12), location: 'Primary Packing Line 2', user: 'Operator Amit', notes: 'Blister packed' }
                    ]
                }))
            }))
        },
        events: [
            { type: 'ORDER_CREATED', time: daysAgo(10), location: 'Sales Office', user: 'John Sales', notes: 'Export order for 500 strips' },
            { type: 'ORDER_CONFIRMED', time: daysAgo(9), location: 'Finance Hub', user: 'Alice Fin', notes: 'Credit check passed' },
            { type: 'FULFILLMENT_STARTED', time: daysAgo(8), location: 'Warehouse - Mumbai', user: 'WMS System', notes: 'Picking started' },
            { type: 'PACKED_&_AGGREGATED', time: daysAgo(7), location: 'Packing Station', user: 'Operator Vijay', notes: 'Aggregated to Pallet PLT-AMOX-001' },
            { type: 'SHIPPED', time: daysAgo(3), location: 'Dispatch Dock', user: 'Logistics Manager', notes: 'Consignment handed to BlueDart' }
        ]
    },
    {
        id: 'SO-PH-002',
        order_number: 'SO-INS-2024-002',
        customer_name: 'Metro Health Hospital Group',
        order_date: daysAgo(5),
        status: 'DELIVERED',
        priority: 'CRITICAL',
        total_value: 48000.00,
        currency: 'INR',
        ship_to_destination: 'Metro City Hospital, Mumbai',
        ship_to_address: 'Annie Besant Rd, Worli, Mumbai 400018',
        tax_code: 'GST-12',
        customer_po: 'MH-PO-0092',
        delivery_date: daysAgo(1),
        lines: [
            { id: 'L1', material_code: 'SYR-PC-100ML', material_name: 'Insulin Glargine Cartridge', quantity: 200, uom: 'Cartridges', unit_price: 240.00, total_price: 48000.00, tax_code: 'GST-LMS-12', tax_amount: 5760.00, hsn_code: '300431' }
        ],
        fulfillment: {
            type: 'CASE',
            serial: 'CASE-INS-5001',
            status: 'DELIVERED',
            children: Array.from({ length: 20 }, (_, i) => ({
                id: `IT-INS-${i+1}`,
                serial: `SN-INS-100-${String(i+1).padStart(3, '0')}`,
                type: 'UNIT',
                status: 'DELIVERED',
                events: [
                    { type: 'COLD_CHAIN_ENTRY', time: daysAgo(15), location: 'Sterile Manufacturing', user: 'Env Monitor', notes: 'Temp: 4.2°C' },
                    { type: 'QC_STERILITY_PASS', time: daysAgo(14), location: 'Microbiology Lab', user: 'Dr. Gupta', notes: 'Negative for microbes' },
                    { type: 'PACKED', time: daysAgo(6), location: 'Cold Packing Area', user: 'Operator Neha', notes: 'Packed with phase change materials' }
                ]
            }))
        },
        events: [
            { type: 'ORDER_CREATED', time: daysAgo(5), location: 'Procurement Portal', user: 'Metro Procurement', notes: 'Urgent cold chain requirement' },
            { type: 'PICKED_IN_COLD_ZONE', time: daysAgo(4), location: 'Deep Freezer Area', user: 'Operator Rahul', notes: 'Picked at -20°C' },
            { type: 'TEMP_VERIFIED', time: daysAgo(4), location: 'Dispatch Bay', user: 'QC Officer', notes: 'Shipment Temp: 3.8°C' },
            { type: 'DELIVERED', time: daysAgo(1), location: 'Hospital Pharmacy', user: 'Hospital Receiver', notes: 'POD signed, temp logger verified' }
        ]
    },
    {
        id: 'SO-PH-003',
        order_number: 'SO-VAC-2024-003',
        customer_name: 'National Vaccination Center',
        order_date: hoursAgo(48),
        status: 'PROCESSING',
        priority: 'EMERGENCY',
        total_value: 0.00,
        currency: 'USD',
        ship_to_destination: 'UNICEF Central Depot, Abuja',
        ship_to_address: 'Plot 617/618 Central Area, Abuja, Nigeria',
        tax_code: 'EXEMPT',
        customer_po: 'UN-VAC-77',
        delivery_date: daysAgo(-2),
        lines: [
            { id: 'L1', material_code: 'VIAL-VC-10ML', material_name: 'mRNA Vaccine Vial', quantity: 100, uom: 'Vials', unit_price: 0.00, total_price: 0.00, tax_code: 'NONE-GOVT', tax_amount: 0.00, hsn_code: '300220' }
        ],
        fulfillment: {
            type: 'CASE',
            serial: 'CASE-VAC-UI-001',
            status: 'PACKED',
            children: Array.from({ length: 10 }, (_, i) => ({
                id: `IT-VAC-${i+1}`,
                serial: `SN-VAC-mRNA-${String(i+1).padStart(3, '0')}`,
                type: 'UNIT',
                status: 'PACKED',
                events: [
                    { type: 'BIO_REACTOR_RELEASE', time: daysAgo(30), location: 'Biotech Site', user: 'Lab Director', notes: 'Yield within 98%' },
                    { type: 'PURIFICATION_DONE', time: daysAgo(25), location: 'Purification Unit', user: 'Scientist K', notes: '99.9% purity' },
                    { type: 'VIAL_FILL_FINISH', time: daysAgo(20), location: 'Fill-Finish Line', user: 'Aseptic Robot 1', notes: 'Fill vol: 10.1ml' }
                ]
            }))
        },
        events: [
            { type: 'ORDER_CREATED', time: hoursAgo(48), location: 'Emergency Portal', user: 'Govt Health Body', notes: 'Direct dispatch requested' },
            { type: 'ALLOCATION_DONE', time: hoursAgo(24), location: 'Master Inventory', user: 'System', notes: 'Batch VAC-2024 allocated' },
            { type: 'PACKING_IN_PROGRESS', time: hoursAgo(2), location: 'Bio-Hazard Station', user: 'Protective Crew', notes: 'Packing into Ultra-Low Temp Shipper' }
        ]
    }
];

