/**
 * Track & Trace Dashboard - Demo Data Generator
 * Comprehensive mock data following GS1 standards with hierarchical drill-down
 */

// GS1 Helper Functions
const generateSSCC = (companyPrefix = '0395600', serial) => {
    const extension = '0';
    const base = `${extension}${companyPrefix}${String(serial).padStart(9, '0')}`;
    // Calculate check digit (simplified)
    const checkDigit = (10 - (base.split('').reduce((acc, d, i) => acc + parseInt(d) * (i % 2 === 0 ? 3 : 1), 0) % 10)) % 10;
    return `${base}${checkDigit}`;
};

const generateGTIN = (companyPrefix = '890123456', itemRef = '789') => {
    const base = `${companyPrefix}${itemRef}`;
    const checkDigit = (10 - (base.split('').reduce((acc, d, i) => acc + parseInt(d) * (i % 2 === 0 ? 1 : 3), 0) % 10)) % 10;
    return `${base}${checkDigit}`;
};

const generateSerial = (prefix, date, sequence) =>
    `${prefix}-${date.replace(/-/g, '')}-${String(sequence).padStart(5, '0')}`;

// Date helpers
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// ============ LOCATIONS DATA ============
export const LOCATIONS = {
    plants: [
        {
            id: 'LOC-PLANT-001',
            code: 'MUM-PHARMA',
            name: 'Strategic Pharma Site - Mumbai',
            type: 'MANUFACTURING',
            gln: '8901234500001',
            address: 'Andheri East, Mumbai, MH 400069',
            events: [
                { id: 'LE-001', type: 'SITE_AUDIT_PASS', timestamp: daysAgo(90), location: 'MUM-PHARMA', user: 'WHO Inspector', notes: 'GMP standards met' },
                { id: 'LE-002', type: 'LICENSE_RENEWED', timestamp: daysAgo(45), location: 'MUM-PHARMA', user: 'FDA System', notes: 'Valid until 2028' }
            ],
            zones: [
                {
                    id: 'ZONE-001',
                    code: 'LINE-01',
                    name: 'Sterile Production Line 01',
                    type: 'ZONE',
                    racks: [
                        {
                            id: 'RACK-001', code: 'R1', name: 'Rack 1', type: 'RACK', bins: [
                                { id: 'BIN-001', code: 'R1-A1', name: 'Bin A1', type: 'BIN', itemCount: 48 },
                                { id: 'BIN-002', code: 'R1-A2', name: 'Bin A2', type: 'BIN', itemCount: 36 },
                                { id: 'BIN-003', code: 'R1-B1', name: 'Bin B1', type: 'BIN', itemCount: 24 }
                            ]
                        }
                    ]
                },
                {
                    id: 'ZONE-002',
                    code: 'QC-LAB',
                    name: 'Pharma Quality Control Lab',
                    type: 'ZONE',
                    racks: [
                        {
                            id: 'RACK-003', code: 'QC-R1', name: 'QC Rack 1', type: 'RACK', bins: [
                                { id: 'BIN-006', code: 'QC-HOLD', name: 'QC Hold', type: 'BIN', itemCount: 8 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'LOC-WH-001',
            code: 'DEL-CC-HUB',
            name: 'National Cold Chain Hub - Delhi',
            type: 'WAREHOUSE',
            gln: '8901234500002',
            address: 'Gurgaon, Haryana 122001',
            events: [
                { id: 'LE-003', type: 'TEMP_CALIBRATION', timestamp: daysAgo(10), location: 'DEL-CC-HUB', user: 'Calibration Eng', notes: 'Freezer sensors +/- 0.1C' }
            ],
            zones: [
                {
                    id: 'ZONE-003',
                    code: 'RECV',
                    name: 'Sterile Receiving Area',
                    type: 'ZONE',
                    racks: [
                        {
                            id: 'RACK-004', code: 'DOCK-1', name: 'Cold Dock 1', type: 'RACK', bins: [
                                { id: 'BIN-007', code: 'D1-STG', name: 'Staging', type: 'BIN', itemCount: 120 }
                            ]
                        }
                    ]
                },
                {
                    id: 'ZONE-004',
                    code: 'STORAGE',
                    name: 'Deep Freezer Storage',
                    type: 'ZONE',
                    racks: [
                        {
                            id: 'RACK-005', code: 'S-A1', name: 'Freezer Rack A1', type: 'RACK', bins: [
                                { id: 'BIN-008', code: 'SA1-01', name: 'Bin 01', type: 'BIN', itemCount: 240 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'LOC-WH-002',
            code: 'BLR-DIST',
            name: 'Bangalore Regional Hub',
            type: 'WAREHOUSE',
            gln: '8901234500003',
            address: 'Electronic City, Bangalore 560100',
            events: [
                { id: 'LE-004', type: 'INVENTORY_SYNC', timestamp: hoursAgo(5), location: 'BLR-DIST', user: 'System', notes: 'Daily stock tally completed' }
            ],
            zones: [
                {
                    id: 'ZONE-BLR-01',
                    code: 'COOL-01',
                    name: 'Cold Storage Room 01',
                    type: 'ZONE',
                    racks: [
                        {
                            id: 'RACK-BLR-01', code: 'A1', name: 'Rack A1', type: 'RACK', bins: [
                                { id: 'BIN-BLR-01', code: 'A1-01', name: 'Bin 01', type: 'BIN', itemCount: 150 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'LOC-CUST-001',
            code: 'MEDPLUS-01',
            name: 'MedPlus Pharmacy - Indiranagar',
            type: 'CUSTOMER',
            gln: '8901234500010',
            address: 'Indiranagar, Bangalore 560038',
            events: []
        }
    ]
};

// ============ MATERIALS / BOM DATA ============
export const MATERIALS = {
    finishedGoods: [
        {
            id: 'MAT-FG-001',
            code: 'AMOXICILLIN-250MG',
            name: 'Amoxicillin 250mg Capsules',
            gtin: generateGTIN('890123456', '001'),
            type: 'FINISHED_GOODS',
            category: 'Antibiotics',
            uom: 'BTR',
            shelfLife: 730, // days
            events: [
                { id: 'ME-001', type: 'BOM_APPROVED', timestamp: daysAgo(365), location: 'Corporate HQ', user: 'Director of Ops', notes: 'v2.1 approved for production' },
                { id: 'ME-002', type: 'GTIN_REGISTERED', timestamp: daysAgo(360), location: 'Regulatory Affairs', user: 'System', notes: 'Registered with GS1 India' },
                { id: 'ME-003', type: 'COMPLIANCE_CLEAR', timestamp: daysAgo(358), location: 'Legal Dept', user: 'Counsel Ray', notes: 'Import/Export permit granted' }
            ],
            subAssemblies: [
                {
                    id: 'MAT-SA-001',
                    code: 'BLISTER-PACK',
                    name: 'Alu-Alu Blister Pack',
                    qtyPerParent: 1,
                    type: 'SUB_ASSEMBLY',
                    components: [
                        {
                            id: 'MAT-COMP-001',
                            code: 'ALU-FOIL',
                            name: 'Forming Aluminum Foil',
                            qtyPerParent: 1,
                            type: 'COMPONENT',
                            rawMaterials: [
                                { id: 'RM-001', code: 'ALU-8011', name: 'Aluminum Alloy 8011', vendor: 'Hindalco', country: 'India', qtyPerParent: 0.05, uom: 'KG', type: 'RAW_MATERIAL' }
                            ]
                        }
                    ]
                },
                {
                    id: 'MAT-SA-002',
                    code: 'POWDER-MIX',
                    name: 'Active Powder Blend',
                    qtyPerParent: 250,
                    uom: 'MG',
                    type: 'SUB_ASSEMBLY',
                    components: [
                        {
                            id: 'MAT-COMP-003',
                            code: 'AMOX-API',
                            name: 'Amoxicillin Trihydrate API',
                            qtyPerParent: 250,
                            type: 'COMPONENT',
                            rawMaterials: [
                                { id: 'RM-003', code: 'API-AMOX', name: 'Amoxicillin Trihydrate', vendor: 'Aurobindo Pharma', country: 'India', qtyPerParent: 250, uom: 'MG', type: 'RAW_MATERIAL' },
                                { id: 'RM-005', code: 'MICRO-CEL', name: 'Microcrystalline Cellulose', vendor: 'DuPont', country: 'USA', qtyPerParent: 20, uom: 'MG', type: 'RAW_MATERIAL' }
                            ]
                        }
                    ]
                }
            ],
            packaging: {
                primary: { type: 'ITEM', label: 'Blister Pack', capacity: 1 },
                secondary: { type: 'CASE', label: 'Unit Box (10 Packs)', capacity: 10 },
                tertiary: { type: 'PALLET', label: 'Master Pallet', capacity: 100 }
            }
        },
        {
            id: 'MAT-FG-002',
            code: 'VAX-CV-10ML',
            name: 'COVID-19 mRNA Vaccine Vial',
            gtin: generateGTIN('890123456', '002'),
            type: 'FINISHED_GOODS',
            category: 'Vaccines',
            uom: 'VIAL',
            shelfLife: 180,
            events: [
                { id: 'ME-004', type: 'R&D_STABILITY_PASS', timestamp: daysAgo(200), location: 'Global Vax Lab', user: 'Scientific Lead', notes: 'Stability at -80C verified' }
            ]
        }
    ]
};

// ============ PACKAGING HIERARCHY DATA ============
const generateEvents = (serial, stages) => {
    return stages.map((stage, idx) => ({
        id: `EVT-${serial}-${idx + 1}`,
        eventType: stage.type,
        timestamp: stage.time,
        location: stage.location,
        locationCode: stage.locationCode,
        user: stage.user,
        notes: stage.notes,
        status: stage.status || 'COMPLETED'
    }));
};

const generateItemEvents = (serial, mfgDate) => generateEvents(serial, [
    { type: 'MANUFACTURED', time: mfgDate, location: 'Mumbai Manufacturing Plant', locationCode: 'MUM-PLANT', user: 'System', notes: 'Item produced on Line A' },
    { type: 'QUALITY_CHECK', time: hoursAgo(167), location: 'QC Area', locationCode: 'MUM-PLANT', user: 'QC Inspector Raj', notes: 'All parameters within spec', status: 'PASS' },
    { type: 'LABELED', time: hoursAgo(166), location: 'Labeling Station', locationCode: 'MUM-PLANT', user: 'Operator Amit', notes: 'GS1 barcode applied' },
    { type: 'SCAN_CONFIRMED', time: hoursAgo(165), location: 'Production Floor', locationCode: 'MUM-PLANT', user: 'Operator Suresh', notes: 'Activated in inventory' },
    { type: 'PACKED_INTO_CASE', time: hoursAgo(160), location: 'Packing Station 2', locationCode: 'MUM-PLANT', user: 'Packer Vijay', notes: 'Packed into BOX-20241208-00001' },
]);

// Generate hierarchical packaging data
export const generatePackagingHierarchy = () => {
    const containers = [];
    const mfgDate = daysAgo(7);

    // Container 1 - In Transit
    containers.push({
        id: 'CNT-2024-001',
        serial: generateSerial('CNT', '2024-12-08', 1),
        sscc: generateSSCC('0395600', 1000001),
        type: 'SHIPPING_CONTAINER',
        status: 'IN_TRANSIT',
        createdAt: daysAgo(5),
        origin: LOCATIONS.plants[0],
        destination: LOCATIONS.plants[1],
        carrier: 'BlueDart Express',
        vehicleNumber: 'MH-04-AB-1234',
        driverName: 'Ramesh Kumar',
        driverContact: '+91-9876543210',
        expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        events: generateEvents('CNT-001', [
            { type: 'CREATED', time: daysAgo(5), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'Logistics Manager', notes: 'Container created for shipment' },
            { type: 'LOADING', time: daysAgo(4), location: 'Loading Dock', locationCode: 'MUM-PLANT', user: 'Dock Operator', notes: 'Loading pallets' },
            { type: 'SEALED', time: daysAgo(3), location: 'Loading Dock', locationCode: 'MUM-PLANT', user: 'Supervisor', notes: 'Container sealed - Seal #SL2024001' },
            { type: 'DISPATCHED', time: daysAgo(3), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'Logistics Manager', notes: 'Vehicle departed' },
            { type: 'IN_TRANSIT', time: daysAgo(2), location: 'Pune Checkpoint', locationCode: 'PUNE-CHK', user: 'System', notes: 'GPS checkpoint passed' },
            { type: 'IN_TRANSIT', time: daysAgo(1), location: 'Jaipur Hub', locationCode: 'JAI-HUB', user: 'System', notes: 'Intermediate hub stop' }
        ]),
        pallets: [
            {
                id: 'PLT-2024-001',
                serial: generateSerial('PLT', '2024-12-08', 1),
                sscc: generateSSCC('0395600', 2000001),
                type: 'PALLET',
                status: 'IN_TRANSIT',
                weight: '250 KG',
                dimensions: '120x100x150 cm',
                caseCount: 4,
                itemCount: 48,
                events: generateEvents('PLT-001', [
                    { type: 'CREATED', time: daysAgo(6), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'Packer Lead', notes: 'Pallet assembled' },
                    { type: 'AGGREGATED', time: daysAgo(5), location: 'Staging Area', locationCode: 'MUM-PLANT', user: 'Packer Lead', notes: 'Cases loaded onto pallet' },
                    { type: 'WRAPPED', time: daysAgo(5), location: 'Wrapping Station', locationCode: 'MUM-PLANT', user: 'Operator', notes: 'Stretch wrap applied' }
                ]),
                cases: [
                    {
                        id: 'BOX-2024-00001',
                        serial: generateSerial('BOX', '2024-12-08', 1),
                        sscc: generateSSCC('0395600', 3000001),
                        gtin: MATERIALS.finishedGoods[0].gtin,
                        type: 'CASE',
                        status: 'IN_TRANSIT',
                        batchId: 'BATCH-2024-1208-A',
                        itemCount: 12,
                        mfgDate: mfgDate,
                        expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
                        events: generateEvents('BOX-001', [
                            { type: 'CREATED', time: daysAgo(7), location: 'Packing Station', locationCode: 'MUM-PLANT', user: 'Packer Vijay', notes: 'Box created' },
                            { type: 'ITEMS_PACKED', time: daysAgo(7), location: 'Packing Station', locationCode: 'MUM-PLANT', user: 'Packer Vijay', notes: '12 items packed' },
                            { type: 'SEALED', time: daysAgo(7), location: 'Packing Station', locationCode: 'MUM-PLANT', user: 'Packer Vijay', notes: 'Box sealed and labeled' }
                        ]),
                        items: Array.from({ length: 12 }, (_, i) => ({
                            id: `ITEM-2024-${String(i + 1).padStart(5, '0')}`,
                            serial: generateSerial('SN', '2024-12-08', i + 1),
                            gtin: MATERIALS.finishedGoods[0].gtin,
                            type: 'ITEM',
                            status: 'IN_TRANSIT',
                            material: MATERIALS.finishedGoods[0],
                            batchId: 'BATCH-2024-1208-A',
                            mfgDate: mfgDate,
                            expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
                            qcStatus: 'PASS',
                            events: generateItemEvents(generateSerial('SN', '2024-12-08', i + 1), mfgDate)
                        }))
                    },
                    {
                        id: 'BOX-2024-00002',
                        serial: generateSerial('BOX', '2024-12-08', 2),
                        sscc: generateSSCC('0395600', 3000002),
                        gtin: MATERIALS.finishedGoods[0].gtin,
                        type: 'CASE',
                        status: 'IN_TRANSIT',
                        batchId: 'BATCH-2024-1208-A',
                        itemCount: 12,
                        mfgDate: mfgDate,
                        expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
                        items: Array.from({ length: 12 }, (_, i) => ({
                            id: `ITEM-2024-${String(i + 13).padStart(5, '0')}`,
                            serial: generateSerial('SN', '2024-12-08', i + 13),
                            gtin: MATERIALS.finishedGoods[0].gtin,
                            type: 'ITEM',
                            status: 'IN_TRANSIT',
                            material: MATERIALS.finishedGoods[0],
                            batchId: 'BATCH-2024-1208-A',
                            mfgDate: mfgDate,
                            expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString()
                        }))
                    },
                    {
                        id: 'BOX-2024-00003',
                        serial: generateSerial('BOX', '2024-12-08', 3),
                        sscc: generateSSCC('0395600', 3000003),
                        gtin: MATERIALS.finishedGoods[0].gtin,
                        type: 'CASE',
                        status: 'IN_TRANSIT',
                        batchId: 'BATCH-2024-1208-A',
                        itemCount: 12,
                        items: Array.from({ length: 12 }, (_, i) => ({
                            id: `ITEM-2024-${String(i + 25).padStart(5, '0')}`,
                            serial: generateSerial('SN', '2024-12-08', i + 25),
                            gtin: MATERIALS.finishedGoods[0].gtin,
                            type: 'ITEM',
                            status: 'IN_TRANSIT',
                            material: MATERIALS.finishedGoods[0]
                        }))
                    },
                    {
                        id: 'BOX-2024-00004',
                        serial: generateSerial('BOX', '2024-12-08', 4),
                        sscc: generateSSCC('0395600', 3000004),
                        gtin: MATERIALS.finishedGoods[0].gtin,
                        type: 'CASE',
                        status: 'IN_TRANSIT',
                        batchId: 'BATCH-2024-1208-A',
                        itemCount: 12,
                        items: Array.from({ length: 12 }, (_, i) => ({
                            id: `ITEM-2024-${String(i + 37).padStart(5, '0')}`,
                            serial: generateSerial('SN', '2024-12-08', i + 37),
                            gtin: MATERIALS.finishedGoods[0].gtin,
                            type: 'ITEM',
                            status: 'IN_TRANSIT',
                            material: MATERIALS.finishedGoods[0]
                        }))
                    }
                ]
            },
            {
                id: 'PLT-2024-002',
                serial: generateSerial('PLT', '2024-12-08', 2),
                sscc: generateSSCC('0395600', 2000002),
                type: 'PALLET',
                status: 'IN_TRANSIT',
                caseCount: 4,
                itemCount: 48,
                cases: Array.from({ length: 4 }, (_, i) => ({
                    id: `BOX-2024-${String(i + 5).padStart(5, '0')}`,
                    serial: generateSerial('BOX', '2024-12-08', i + 5),
                    sscc: generateSSCC('0395600', 3000005 + i),
                    type: 'CASE',
                    status: 'IN_TRANSIT',
                    itemCount: 12,
                    items: Array.from({ length: 12 }, (_, j) => ({
                        id: `ITEM-2024-${String(49 + i * 12 + j).padStart(5, '0')}`,
                        serial: generateSerial('SN', '2024-12-08', 49 + i * 12 + j),
                        type: 'ITEM',
                        status: 'IN_TRANSIT'
                    }))
                }))
            }
        ]
    });

    // Container 2 - Delivered
    containers.push({
        id: 'CNT-2024-002',
        serial: generateSerial('CNT', '2024-12-05', 1),
        sscc: generateSSCC('0395600', 1000002),
        type: 'SHIPPING_CONTAINER',
        status: 'DELIVERED',
        createdAt: daysAgo(10),
        deliveredAt: daysAgo(3),
        origin: LOCATIONS.plants[0],
        destination: LOCATIONS.plants[2],
        carrier: 'DTDC',
        events: generateEvents('CNT-002', [
            { type: 'CREATED', time: daysAgo(10), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'System', notes: 'Container created' },
            { type: 'DISPATCHED', time: daysAgo(9), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'Logistics', notes: 'Departed' },
            { type: 'IN_TRANSIT', time: daysAgo(6), location: 'Hyderabad Hub', locationCode: 'HYD-HUB', user: 'System', notes: 'Hub stop' },
            { type: 'DELIVERED', time: daysAgo(3), location: 'Bangalore Hub', locationCode: 'BLR-HUB', user: 'Receiver Priya', notes: 'Received and verified' }
        ]),
        pallets: [
            {
                id: 'PLT-2024-003',
                serial: generateSerial('PLT', '2024-12-05', 1),
                sscc: generateSSCC('0395600', 2000003),
                type: 'PALLET',
                status: 'DELIVERED',
                caseCount: 6,
                itemCount: 72,
                cases: Array.from({ length: 6 }, (_, i) => ({
                    id: `BOX-2024-${String(i + 20).padStart(5, '0')}`,
                    serial: generateSerial('BOX', '2024-12-05', i + 1),
                    type: 'CASE',
                    status: 'DELIVERED',
                    itemCount: 12,
                    items: Array.from({ length: 12 }, (_, j) => ({
                        id: `ITEM-2024-${String(200 + i * 12 + j).padStart(5, '0')}`,
                        serial: generateSerial('SN', '2024-12-05', 1 + i * 12 + j),
                        type: 'ITEM',
                        status: 'DELIVERED'
                    }))
                }))
            }
        ]
    });

    // Container 3 - At Origin (Loading)
    containers.push({
        id: 'CNT-2024-003',
        serial: generateSerial('CNT', '2024-12-15', 1),
        sscc: generateSSCC('0395600', 1000003),
        type: 'SHIPPING_CONTAINER',
        status: 'LOADING',
        createdAt: hoursAgo(6),
        origin: LOCATIONS.plants[0],
        destination: LOCATIONS.plants[3],
        events: generateEvents('CNT-003', [
            { type: 'CREATED', time: hoursAgo(6), location: 'Mumbai Plant', locationCode: 'MUM-PLANT', user: 'System', notes: 'Container created' },
            { type: 'LOADING', time: hoursAgo(4), location: 'Loading Dock', locationCode: 'MUM-PLANT', user: 'Dock Operator', notes: 'Loading in progress' }
        ]),
        pallets: [
            {
                id: 'PLT-2024-004',
                serial: generateSerial('PLT', '2024-12-15', 1),
                sscc: generateSSCC('0395600', 2000004),
                type: 'PALLET',
                status: 'LOADING',
                caseCount: 3,
                itemCount: 36,
                cases: Array.from({ length: 3 }, (_, i) => ({
                    id: `BOX-2024-${String(i + 30).padStart(5, '0')}`,
                    serial: generateSerial('BOX', '2024-12-15', i + 1),
                    type: 'CASE',
                    status: 'SEALED',
                    itemCount: 12
                }))
            }
        ]
    });

    return containers;
};

// ============ AGGREGATED STATS ============
export const calculateStats = (containers) => {
    let totalItems = 0;
    let inTransit = 0;
    let delivered = 0;
    let atManufacturing = 0;
    let inQCHold = 0;

    containers.forEach(container => {
        container.pallets?.forEach(pallet => {
            pallet.cases?.forEach(caseBox => {
                const count = caseBox.itemCount || caseBox.items?.length || 0;
                totalItems += count;

                if (caseBox.status === 'IN_TRANSIT') inTransit += count;
                else if (caseBox.status === 'DELIVERED') delivered += count;
                else if (caseBox.status === 'LOADING' || caseBox.status === 'SEALED') atManufacturing += count;
            });
        });
    });

    return {
        totalItems,
        activeShipments: containers.filter(c => c.status === 'IN_TRANSIT').length,
        inTransit,
        delivered,
        atManufacturing,
        inQCHold: 8, // Demo value
        complianceRate: 98.5,
        containers: containers.length,
        pallets: containers.reduce((acc, c) => acc + (c.pallets?.length || 0), 0),
        cases: containers.reduce((acc, c) => acc + (c.pallets?.reduce((pa, p) => pa + (p.cases?.length || 0), 0) || 0), 0)
    };
};

// ============ SEARCH FUNCTION ============
export const searchBySerial = (containers, query) => {
    const q = query.toLowerCase();
    const results = [];

    containers.forEach(container => {
        if (container.serial?.toLowerCase().includes(q) || container.sscc?.includes(q)) {
            results.push({ type: 'CONTAINER', data: container });
        }
        container.pallets?.forEach(pallet => {
            if (pallet.serial?.toLowerCase().includes(q) || pallet.sscc?.includes(q)) {
                results.push({ type: 'PALLET', data: pallet, parent: container });
            }
            pallet.cases?.forEach(caseBox => {
                if (caseBox.serial?.toLowerCase().includes(q) || caseBox.sscc?.includes(q)) {
                    results.push({ type: 'CASE', data: caseBox, parent: pallet, grandParent: container });
                }
                caseBox.items?.forEach(item => {
                    if (item.serial?.toLowerCase().includes(q)) {
                        results.push({ type: 'ITEM', data: item, parent: caseBox });
                    }
                });
            });
        });
    });

    return results;
};

// ============ MAIN EXPORT ============
export const loadDemoData = () => ({
    containers: generatePackagingHierarchy(),
    locations: LOCATIONS,
    materials: MATERIALS,
    stats: null // Will be calculated after containers are loaded
});

export default loadDemoData;
