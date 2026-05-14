/**
 * Order Lifecycle Dashboard - Specialized Pharma Demo Data
 */
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const ORDER_LIFECYCLE_DATA = [
    {
        id: 'SO-PH-001',
        order_number: 'SO-SOLN-2024-001',
        customer_name: 'Novartis Global Distribution',
        order_date: daysAgo(10),
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        total_value: 45000.00,
        currency: 'USD',
        ship_to_destination: 'Zurich Cold Storage, Switzerland',
        ship_to_address: 'Industriestrasse 25, 8005 Zürich, Switzerland',
        tax_code: 'VAT-CH-7.7',
        customer_po: 'PO-NOV-8821',
        delivery_date: daysAgo(2),
        lines: [
            { 
                id: 'L1', 
                material_code: 'SOLN001', 
                material_name: 'Solu-Medrol 1g Injection', 
                quantity: 2000, 
                uom: 'Vials', 
                unit_price: 22.50, 
                total_price: 45000.00, 
                hsn_code: '300410',
                events: [
                    { type: 'ORDERED', time: daysAgo(10), location: 'Client ERP', user: 'Auto-Procure', notes: 'Electronic Data Interchange (EDI) received' },
                    { type: 'PROCESSED', time: daysAgo(9), location: 'Supply Chain Hub', user: 'Maria S.', notes: 'Inventory allocated from Batch B-9921' },
                    { type: 'PACKED', time: daysAgo(8), location: 'Sterile Packing Zone 4', user: 'Operator X', notes: 'Packed in vacuum-sealed thermo-shippers' },
                    { type: 'SHIPPED', time: daysAgo(7), location: 'Dispatch Dock A', user: 'Logistics Lead', notes: 'Handed over to Cold-Chain Express' },
                    { type: 'DELIVERED', time: daysAgo(3), location: 'Zurich Hub', user: 'Receiver Y', notes: 'Temperature logger verified: 4.2°C' }
                ],
                shipments: [
                    {
                        id: 'SHIP-SOLN-001A',
                        serial: 'SH-NOV-99102',
                        type: 'SHIPMENT',
                        status: 'DELIVERED',
                        carrier: 'DHL Medical Express',
                        tracking_url: '/trace?id=SH-NOV-99102',
                        events: [
                            { type: 'PICKED_UP', time: daysAgo(7), location: 'Mumbai Dispatch', notes: 'GPS Tracker Activated' },
                            { type: 'IN_TRANSIT', time: daysAgo(5), location: 'Frankfurt Airport', notes: 'Clearing Customs' },
                            { type: 'DELIVERED', time: daysAgo(3), location: 'Zurich Depot', notes: 'POD Signed by Dr. Klaus' }
                        ]
                    },
                    {
                        id: 'SHIP-SOLN-001B',
                        serial: 'SH-NOV-99103',
                        type: 'SHIPMENT',
                        status: 'IN_TRANSIT',
                        carrier: 'DHL Medical Express',
                        tracking_url: '/trace?id=SH-NOV-99103',
                        events: [
                            { type: 'PICKED_UP', time: daysAgo(7), location: 'Mumbai Dispatch', notes: 'GPS Tracker Activated' },
                            { type: 'IN_TRANSIT', time: daysAgo(4), location: 'Dubai Hub', notes: 'Delayed due to flight schedule' }
                        ]
                    }
                ]
            }
        ],
        events: [
            { type: 'ORDER_CREATED', time: daysAgo(10), location: 'Customer Portal', user: 'Global Procurement', notes: 'Official Purchase Order Received' },
            { type: 'IN_PROGRESS', time: daysAgo(8), location: 'Manufacturing Site', user: 'Ops Manager', notes: 'Fulfillment sequence initiated' }
        ]
    },
    {
        id: 'SO-PH-002',
        order_number: 'SO-INS-2024-002',
        customer_name: 'Mayo Clinic Healthcare',
        order_date: daysAgo(15),
        status: 'CLOSED',
        priority: 'CRITICAL',
        total_value: 120000.00,
        currency: 'USD',
        ship_to_destination: 'Rochester Medical Center, MN',
        ship_to_address: '200 First St. SW, Rochester, MN 55905',
        tax_code: 'US-EXEMPT',
        customer_po: 'MC-PO-5512',
        delivery_date: daysAgo(5),
        lines: [
            { 
                id: 'L2', 
                material_code: 'INS-GL-10', 
                material_name: 'Insulin Glargine 100 U/mL', 
                quantity: 500, 
                uom: 'Kits', 
                unit_price: 240.00, 
                total_price: 120000.00, 
                hsn_code: '300431',
                events: [
                    { type: 'ORDERED', time: daysAgo(15), location: 'Mayo Procurement', notes: 'Emergency Stock Replenishment' },
                    { type: 'PROCESSED', time: daysAgo(14), location: 'Global Logistics', notes: 'Priority-1 processing' },
                    { type: 'PACKED', time: daysAgo(13), location: 'Cold Zone', notes: 'Dry ice packaging' },
                    { type: 'SHIPPED', time: daysAgo(12), location: 'Airport Dispatch', notes: 'Charter Flight CF-992' },
                    { type: 'DELIVERED', time: daysAgo(6), location: 'Mayo Hospital', notes: 'Pharmacy receipt confirmed' }
                ],
                shipments: [
                    {
                        id: 'SHIP-INS-002',
                        serial: 'SH-MAYO-44122',
                        type: 'SHIPMENT',
                        status: 'DELIVERED',
                        carrier: 'FedEx Clinical Services',
                        tracking_url: '/trace?id=SH-MAYO-44122',
                        events: [
                            { type: 'DELIVERED', time: daysAgo(6), location: 'Rochester, MN', notes: 'Signature: J. Doe' }
                        ]
                    }
                ]
            }
        ],
        events: [
            { type: 'ORDER_CREATED', time: daysAgo(15), location: 'B2B API', user: 'System', notes: 'Auto-order triggered by low inventory' },
            { type: 'CLOSED', time: daysAgo(5), location: 'ERP Main', user: 'Finance Bot', notes: 'Invoice settled and order reconciled' }
        ]
    },
    {
        id: 'SO-PH-003',
        order_number: 'SO-VAC-2024-003',
        customer_name: 'UNICEF Supply Division',
        order_date: hoursAgo(24),
        status: 'CREATED',
        priority: 'EMERGENCY',
        total_value: 0.00,
        currency: 'USD',
        ship_to_destination: 'Central Depot, Copenhagen',
        ship_to_address: 'Oceanvej 10-12, 2150 Nordhavn, Denmark',
        tax_code: 'DIPLOMATIC',
        customer_po: 'UN-VAC-COVAX',
        delivery_date: daysAgo(-7),
        lines: [
            { 
                id: 'L3', 
                material_code: 'VC-mRNA-01', 
                material_name: 'mRNA COVID-19 Vaccine', 
                quantity: 10000, 
                uom: 'Vials', 
                unit_price: 0.00, 
                total_price: 0.00, 
                hsn_code: '300220',
                events: [
                    { type: 'ORDERED', time: hoursAgo(24), location: 'UNICEF Portal', notes: 'Emergency Allocation' }
                ],
                shipments: []
            }
        ],
        events: [
            { type: 'ORDER_CREATED', time: hoursAgo(24), location: 'Global Hub', user: 'Admin', notes: 'Pending manufacturing allocation' }
        ]
    }
];


