import { supabase } from './supabaseClient';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const MaterialsAPI = {
  list: async () => {
    const { data, error } = await supabase.from('materials').select(`
      *,
      material_image(*)
    `);
    if (error) throw error;
    return data.map(transformMaterial);
  },
  get: async (code) => {
    const { data, error } = await supabase.from('materials').select(`
      *,
      material_image(*),
      handling_parameter(*)
    `).eq('code', code).single();
    if (error) throw error;
    return transformMaterial(data);
  },
  create: async (item) => {
    const payload = {
      id: generateUUID(),
      code: item.code,
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      base_uom: item.baseUom,
      is_batch_managed: item.isBatchManaged,
      is_serial_managed: item.isSerialManaged,
      shelf_life_days: item.shelfLifeDays,
      min_stock: item.minStock,
      max_stock: item.maxStock,
      gross_weight: item.grossWeight,
      net_weight: item.netWeight,
      weight_uom: item.weightUom,
      length: item.length,
      width: item.width,
      height: item.height,
      dimension_uom: item.dimensionUom,
      is_hazmat: item.isHazmat,
      hazmat_class: item.hazmatClass,
      un_number: item.unNumber,
      status: item.status || 'ACTIVE'
    };
    const { data, error } = await supabase.from('materials').insert([payload]).select().single();
    if (error) throw error;
    return transformMaterial(data);
  },
  update: async (code, item) => {
    const payload = {
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      base_uom: item.baseUom,
      is_batch_managed: item.isBatchManaged,
      is_serial_managed: item.isSerialManaged,
      shelf_life_days: item.shelfLifeDays,
      min_stock: item.minStock,
      max_stock: item.maxStock,
      gross_weight: item.grossWeight,
      net_weight: item.netWeight,
      weight_uom: item.weightUom,
      length: item.length,
      width: item.width,
      height: item.height,
      dimension_uom: item.dimensionUom,
      is_hazmat: item.isHazmat,
      hazmat_class: item.hazmatClass,
      un_number: item.unNumber
    };
    const { data, error } = await supabase.from('materials').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return transformMaterial(data);
  },
  remove: async (code) => {
    const { error } = await supabase.from('materials').delete().eq('code', code);
    if (error) throw error;
  }
};

export const LocationAPI = {
  list: async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    return data.map(transformLocation);
  },
  getTree: async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    return data.map(transformLocation);
  },
  getChildren: async (parentId) => {
    let query = supabase.from('locations').select('*');
    if (parentId === 'root' || !parentId) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformLocation);
  },
  get: async (code) => {
    const { data, error } = await supabase.from('locations').select('*').eq('code', code).single();
    if (error) throw error;
    return transformLocation(data);
  },
  create: async (item) => {
    const payload = {
      id: generateUUID(),
      code: item.code,
      name: item.name,
      type: item.type,
      category: item.category,
      parent_id: item.parentId,
      address_line1: item.address,
      status: 'ACTIVE'
    };
    const { data, error } = await supabase.from('locations').insert([payload]).select().single();
    if (error) throw error;
    return transformLocation(data);
  },
  update: async (code, item) => {
    const payload = {
      name: item.name,
      type: item.type,
      category: item.category,
      parent_id: item.parentId,
      address_line1: item.address
    };
    const { data, error } = await supabase.from('locations').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return transformLocation(data);
  },
  getRoots: async () => {
    const { data, error } = await supabase.from('locations').select('*').is('parent_id', null);
    if (error) throw error;
    return data.map(transformLocation);
  },
};

export const MasterDefinitionsAPI = {
  list: async () => {
    const { data, error } = await supabase.from('master_definitions').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      defType: d.def_type,
      defValue: d.def_value,
      description: d.description
    }));
  },
  create: async (item) => {
    const { data, error } = await supabase.from('master_definitions').insert([{
      def_type: item.defType,
      def_value: item.defValue,
      description: item.description
    }]).select().single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    const { error } = await supabase.from('master_definitions').delete().eq('id', id);
    if (error) throw error;
  }
};

export const PackagingAPI = {
  getHierarchies: async (materialCode = null) => {
    let query = supabase.from('packaging_hierarchy').select('*');
    if (materialCode) {
        // This assumes hierarchy has a material_code or we link via name for now
        // Based on my seeding, I'll use a loose filter or update schema
        query = query.ilike('name', `%${materialCode}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  createHierarchy: async (item) => {
    const { data, error } = await supabase.from('packaging_hierarchy').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  getLevels: async (hierarchyId) => {
    const { data, error } = await supabase.from('packaging_level')
      .select(`*, label_template:label_templates(*)`)
      .eq('hierarchy_id', hierarchyId)
      .order('level_order', { ascending: true });
    if (error) throw error;
    return data;
  },
  createLevel: async (item) => {
    const { data, error } = await supabase.from('packaging_level').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  updateLevel: async (id, item) => {
    const { data, error } = await supabase.from('packaging_level').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteLevel: async (id) => {
    const { error } = await supabase.from('packaging_level').delete().eq('id', id);
    if (error) throw error;
  }
};

export const InventoryAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('inventory').select(`
            *,
            material:materials(id, code, name),
            location:locations(id, code, name)
        `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.materialId) {
      query = query.eq('material_id', filters.materialId);
    }
    if (filters.batchNumber) {
      query = query.eq('batch_number', filters.batchNumber);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(transformInventory);
  },

  markAsPrinted: async (ids) => {
    const { data, error } = await supabase.from('inventory')
      .update({ label_printed: 'Y' })
      .in('id', ids)
      .select();
    if (error) throw error;
    return data;
  },

  get: async (id) => {
    const { data, error } = await supabase.from('inventory').select(`
            *,
            material:materials(id, code, name),
            location:locations(id, code, name)
        `).eq('id', id).single();
    if (error) throw error;
    return transformInventory(data);
  },

  getBySerial: async (serialNumber) => {
    const { data, error } = await supabase.from('inventory').select(`
            *,
            material:materials(id, code, name),
            location:locations(id, code, name)
        `).eq('serial_number', serialNumber).single();
    if (error) throw error;
    return transformInventory(data);
  },

  getByBatch: async (batchNumber) => {
    const { data, error } = await supabase.from('inventory').select(`
            *,
            material:materials(id, code, name),
            location:locations(id, code, name)
        `).eq('batch_number', batchNumber);
    if (error) throw error;
    return data.map(transformInventory);
  },

  create: async (item) => {
    const payload = {
      material_id: item.materialId,
      serial_number: item.serialNumber,
      batch_number: item.batchNumber,
      status: item.status || 'PRE_INVENTORY',
      location_id: item.locationId,
      quality_status: item.qualityStatus || 'PENDING',
      manufactured_at: item.manufacturedAt,
      expires_at: item.expiresAt
    };
    const { data, error } = await supabase.from('inventory').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  createFromSerials: async (materialId, batchNumber, serialNumbers, locationId) => {
    const items = serialNumbers.map(sn => ({
      material_id: materialId,
      serial_number: sn,
      batch_number: batchNumber,
      status: 'PRE_INVENTORY',
      location_id: locationId
    }));
    const { data, error } = await supabase.from('inventory').insert(items).select();
    if (error) throw error;
    return data;
  },

  confirmScan: async (serialNumber, locationId, confirmedBy) => {
    const { data, error } = await supabase.from('inventory')
      .update({
        status: 'ACTIVE',
        scan_location_id: locationId,
        confirmed_at: new Date().toISOString(),
        confirmed_by: confirmedBy
      })
      .eq('serial_number', serialNumber)
      .eq('status', 'PRE_INVENTORY')
      .select()
      .single();
    if (error) throw error;

    await supabase.from('serial_number_pool')
      .update({ status: 'CONSUMED' })
      .eq('serial_number', serialNumber);

    return data;
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from('inventory')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateQualityStatus: async (id, qualityStatus) => {
    const { data, error } = await supabase.from('inventory')
      .update({ quality_status: qualityStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getCountsByStatus: async () => {
    const { data, error } = await supabase.from('inventory').select('status');
    if (error) throw error;
    const counts = {};
    data.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }
};

const transformInventory = (i) => ({
  id: i.id,
  materialId: i.material?.id,
  materialCode: i.material?.code || i.material_code,
  materialName: i.material?.name || i.material_code || 'Unnamed Material',
  serialNumber: i.serial_number,
  batchNumber: i.batch_number || 'N/A',
  status: i.status,
  qualityStatus: i.quality_status || 'PENDING',
  locationId: i.location?.id,
  locationCode: i.location?.code,
  locationName: i.location?.name,
  manufacturedAt: i.manufactured_at,
  expiresAt: i.expires_at,
  confirmedAt: i.confirmed_at,
  confirmedBy: i.confirmed_by,
  parentContainerType: i.parent_container_type,
  parentContainerId: i.parent_container_id,
  labelPrinted: i.label_printed,
  createdAt: i.created_at
});

export const SerialPoolAPI = {
  reserveSerials: async (materialId, batchNumber, quantity, createdBy = null) => {
    const { data, error } = await supabase.rpc('reserve_serial_numbers', {
      p_material_id: materialId,
      p_batch_number: batchNumber,
      p_quantity: quantity,
      p_created_by: createdBy
    });
    if (error) throw error;
    return data;
  },

  generateSerial: async (materialId) => {
    const { data, error } = await supabase.rpc('generate_serial_number', {
      p_material_id: materialId
    });
    if (error) throw error;
    return data;
  },

  getAvailable: async (materialId, batchNumber = null) => {
    let query = supabase.from('serial_number_pool')
      .select('*')
      .eq('material_id', materialId)
      .eq('status', 'RESERVED')
      .order('serial_number', { ascending: true });

    if (batchNumber) {
      query = query.eq('batch_number', batchNumber);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getByBatch: async (batchNumber) => {
    const { data, error } = await supabase.from('serial_number_pool')
      .select(`*, material:materials(code, name)`)
      .eq('batch_number', batchNumber)
      .order('serial_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  assignToInventory: async (serialNumber, inventoryId) => {
    const { data, error } = await supabase.rpc('assign_serial_to_inventory', {
      p_serial_number: serialNumber,
      p_inventory_id: inventoryId
    });
    if (error) throw error;
    return data;
  },

  voidSerial: async (serialNumber) => {
    const { data, error } = await supabase.from('serial_number_pool')
      .update({ status: 'VOIDED' })
      .eq('serial_number', serialNumber)
      .eq('status', 'RESERVED')
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getBySerial: async (serialNumber) => {
    const { data, error } = await supabase.from('serial_number_pool')
      .select(`*, material:materials(code, name)`)
      .eq('serial_number', serialNumber)
      .single();
    if (error) throw error;
    return data;
  },

  getCountsByStatus: async (materialId = null) => {
    let query = supabase.from('serial_number_pool').select('status');
    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    const { data, error } = await query;
    if (error) throw error;
    const counts = { RESERVED: 0, ASSIGNED: 0, CONSUMED: 0, VOIDED: 0 };
    data.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }
};

// =====================================================
// CONTAINER API
// Manages containers (boxes, pallets, shipping containers)
// =====================================================
export const ContainerAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('container_unit').select(`
      *,
      location:locations(id, code, name),
      packaging_level:packaging_level(id, level_name)
    `);

    if (filters.containerType) {
      query = query.eq('container_type', filters.containerType);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.locationId) {
      query = query.eq('location_id', filters.locationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  get: async (id) => {
    const { data, error } = await supabase.from('container_unit').select(`
      *,
      location:locations(id, code, name),
      packaging_level:packaging_level(id, level_name)
    `).eq('id', id).single();
    if (error) throw error;
    return data;
  },

  getBySerial: async (serialNumber) => {
    const { data, error } = await supabase.from('container_unit').select(`
      *,
      location:locations(id, code, name),
      packaging_level:packaging_level(id, level_name)
    `).eq('serial_number', serialNumber).single();
    if (error) throw error;
    return data;
  },

  create: async (containerType, options = {}) => {
    const { data, error } = await supabase.rpc('create_container', {
      p_container_type: containerType,
      p_packaging_level_id: options.packagingLevelId || null,
      p_location_id: options.locationId || null,
      p_capacity: options.capacity || null,
      p_batch_number: options.batchNumber || null,
      p_created_by: options.createdBy || null
    });
    if (error) throw error;
    return data;
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from('container_unit')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  seal: async (id) => {
    const { data, error } = await supabase.from('container_unit')
      .update({
        status: 'SEALED',
        sealed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getContents: async (containerId) => {
    const { data, error } = await supabase.rpc('get_container_contents', {
      p_container_id: containerId
    });
    if (error) throw error;
    return data;
  },

  getCountsByType: async () => {
    const { data, error } = await supabase.from('container_unit').select('container_type, status');
    if (error) throw error;

    const counts = {};
    data.forEach(item => {
      if (!counts[item.container_type]) {
        counts[item.container_type] = { total: 0, byStatus: {} };
      }
      counts[item.container_type].total++;
      counts[item.container_type].byStatus[item.status] =
        (counts[item.container_type].byStatus[item.status] || 0) + 1;
    });
    return counts;
  }
};

// =====================================================
// AGGREGATION API
// Manages packing/unpacking of items into containers
// =====================================================
export const AggregationAPI = {
  pack: async (parentId, childType, childIds, createdBy = null) => {
    const { data, error } = await supabase.rpc('pack_items', {
      p_parent_id: parentId,
      p_child_type: childType,
      p_child_ids: childIds,
      p_created_by: createdBy
    });
    if (error) throw error;
    return data;
  },

  unpack: async (parentId, childType, childIds, createdBy = null) => {
    const { data, error } = await supabase.rpc('unpack_items', {
      p_parent_id: parentId,
      p_child_type: childType,
      p_child_ids: childIds,
      p_created_by: createdBy
    });
    if (error) throw error;
    return data;
  },

  getContainerContents: async (containerId) => {
    const { data, error } = await supabase.rpc('get_container_contents', {
      p_container_id: containerId
    });
    if (error) throw error;
    return data;
  },

  getItemParent: async (childType, childId) => {
    const { data, error } = await supabase.from('aggregation')
      .select(`
        *,
        parent_container:container_unit!parent_id(id, serial_number, container_type, status)
      `)
      .eq('child_type', childType)
      .eq('child_id', childId)
      .eq('status', 'ACTIVE')
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  getFullHierarchy: async (itemSerialNumber) => {
    // Get inventory item
    const { data: item, error: itemError } = await supabase.from('inventory')
      .select('*')
      .eq('serial_number', itemSerialNumber)
      .single();
    if (itemError) throw itemError;

    const hierarchy = [{ type: 'INVENTORY', id: item.id, serial: item.serial_number }];

    // Traverse up the hierarchy
    let currentType = 'INVENTORY';
    let currentId = item.id;

    while (true) {
      const { data: agg } = await supabase.from('aggregation')
        .select(`
          parent_type, parent_id,
          parent_container:container_unit!parent_id(id, serial_number, container_type)
        `)
        .eq('child_type', currentType)
        .eq('child_id', currentId)
        .eq('status', 'ACTIVE')
        .single();

      if (!agg) break;

      hierarchy.push({
        type: agg.parent_type,
        id: agg.parent_id,
        serial: agg.parent_container?.serial_number
      });

      currentType = agg.parent_type;
      currentId = agg.parent_id;
    }

    return hierarchy;
  },

  listActive: async (filters = {}) => {
    let query = supabase.from('aggregation')
      .select('*')
      .eq('status', 'ACTIVE');

    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }
    if (filters.childType) {
      query = query.eq('child_type', filters.childType);
    }

    const { data, error } = await query.order('aggregated_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const LabelTemplateAPI = {
  list: async () => {
    const { data, error } = await supabase.from('label_templates').select('*');
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await supabase.from('label_templates').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (item) => {
    const { data, error } = await supabase.from('label_templates').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, item) => {
    const { data, error } = await supabase.from('label_templates').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

export const TraceAPI = {
  list: async () => {
    const { data, error } = await supabase.from('trace_event').select('*');
    if (error) throw error;
    return data;
  },

  create: async (item) => {
    const { data, error } = await supabase.from('trace_event').insert([item]).select().single();
    if (error) throw error;
    return data;
  },

  getItemTimeline: async (serialNumber) => {
    const { data, error } = await supabase.rpc('get_item_timeline', {
      p_serial_number: serialNumber
    });
    if (error) throw error;
    return data;
  },

  getContainerTimeline: async (containerSerial) => {
    const { data, error } = await supabase.rpc('get_container_timeline', {
      p_container_serial: containerSerial
    });
    if (error) throw error;
    return data;
  },

  getItemHierarchy: async (serialNumber) => {
    const { data, error } = await supabase.rpc('get_item_hierarchy', {
      p_serial_number: serialNumber
    });
    if (error) throw error;
    return data;
  },

  getRecentEvents: async (limit = 50) => {
    const { data, error } = await supabase.from('recent_events')
      .select('*')
      .limit(limit);
    if (error) throw error;
    return data;
  },

  searchBySerial: async (serial) => {
    // Try inventory first
    const { data: invData } = await supabase.from('inventory')
      .select(`*, material:materials(code, name), location:locations(code, name)`)
      .eq('serial_number', serial)
      .single();

    if (invData) {
      return { type: 'INVENTORY', data: invData };
    }

    // Try container
    const { data: contData } = await supabase.from('container_unit')
      .select(`*, location:locations(code, name)`)
      .eq('serial_number', serial)
      .single();

    if (contData) {
      return { type: 'CONTAINER', data: contData };
    }

    return null;
  },

  getHistory: async (serialOrContainerId) => {
    // First try to search for item
    const result = await TraceAPI.searchBySerial(serialOrContainerId);

    if (!result) {
      return null;
    }

    // Get timeline based on type
    if (result.type === 'INVENTORY') {
      try {
        const data = await TraceAPI.getItemTimeline(serialOrContainerId);
        return { ...result, events: data };
      } catch (e) {
        console.log('Timeline fetch failed, returning basic result');
        return result;
      }
    } else {
      try {
        const data = await TraceAPI.getContainerTimeline(serialOrContainerId);
        return { ...result, events: data };
      } catch (e) {
        console.log('Timeline fetch failed, returning basic result');
        return result;
      }
    }
  }
};

// =====================================================
// DASHBOARD API
// Metrics, alerts, and analytics for the dashboard
// =====================================================
export const DashboardAPI = {
  getMetrics: async () => {
    try {
      const { data, error } = await supabase.from('dashboard_metrics').select('*').single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.log('dashboard_metrics view not available, using fallback');
    }

    // Fallback - calculate manually from base tables
    try {
      const [invCounts, contCounts, serialCounts] = await Promise.all([
        InventoryAPI.getCountsByStatus().catch(() => ({})),
        ContainerAPI.getCountsByType().catch(() => ({})),
        SerialPoolAPI.getCountsByStatus().catch(() => ({}))
      ]);

      return {
        pre_inventory_count: invCounts['PRE_INVENTORY'] || 0,
        active_inventory_count: invCounts['ACTIVE'] || 0,
        packed_count: invCounts['PACKED'] || 0,
        shipped_count: invCounts['SHIPPED'] || 0,
        delivered_count: invCounts['DELIVERED'] || 0,
        total_inventory_count: Object.values(invCounts || {}).reduce((a, b) => a + b, 0),
        box_count: contCounts['BOX']?.total || 0,
        pallet_count: contCounts['PALLET']?.total || 0,
        reserved_serials: serialCounts?.RESERVED || 0,
        consumed_serials: serialCounts?.CONSUMED || 0,
        sealed_containers: 0,
        events_last_24h: 0,
        items_created_24h: 0
      };
    } catch (e) {
      console.error('Fallback metrics also failed', e);
      return {
        pre_inventory_count: 0,
        active_inventory_count: 0,
        packed_count: 0,
        shipped_count: 0,
        delivered_count: 0,
        total_inventory_count: 0,
        box_count: 0,
        pallet_count: 0,
        reserved_serials: 0,
        consumed_serials: 0,
        sealed_containers: 0
      };
    }
  },

  getAlerts: async (limit = 20) => {
    try {
      const { data, error } = await supabase.from('dashboard_alerts')
        .select('*')
        .limit(limit);
      if (!error) return data || [];
    } catch (e) {
      console.log('dashboard_alerts view not available');
    }
    return [];
  },

  getInventoryByStage: async () => {
    try {
      const { data, error } = await supabase.rpc('get_inventory_by_stage');
      if (!error && data) return data;
    } catch (e) {
      console.log('get_inventory_by_stage not available, using fallback');
    }

    // Fallback
    try {
      const counts = await InventoryAPI.getCountsByStatus();
      const total = Object.values(counts || {}).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(counts || {}).map(([stage, count]) => ({
        stage,
        count,
        percentage: Math.round((count / total) * 100)
      }));
    } catch (e) {
      return [];
    }
  },

  getRecentEvents: async (limit = 10) => {
    try {
      const { data, error } = await supabase.from('trace_event')
        .select(`
          *,
          inventory:inventory(serial_number),
          container:container_unit(serial_number)
        `)
        .order('event_timestamp', { ascending: false })
        .limit(limit);
      if (!error) return data || [];
    } catch (e) {
      console.log('trace_event query failed');
    }
    return [];
  },

  getActivitySummary: async (days = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase.from('trace_event')
        .select('event_type, event_timestamp')
        .gte('event_timestamp', startDate.toISOString());

      if (error) return {};

      // Group by day
      const byDay = {};
      (data || []).forEach(event => {
        const day = new Date(event.event_timestamp).toLocaleDateString();
        byDay[day] = (byDay[day] || 0) + 1;
      });

      return byDay;
    } catch (e) {
      return {};
    }
  }
};

// =====================================================
// SHIPMENT API
// Manages shipments and delivery tracking
// =====================================================
export const ShipmentAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('shipment_summary').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.originLocationId) {
      query = query.eq('origin_location_id', filters.originLocationId);
    }
    if (filters.destinationLocationId) {
      query = query.eq('destination_location_id', filters.destinationLocationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  get: async (id) => {
    const { data, error } = await supabase.from('shipment').select(`
      *,
      origin:locations!origin_location_id(id, code, name),
      destination:locations!destination_location_id(id, code, name)
    `).eq('id', id).single();
    if (error) throw error;
    return data;
  },

  getByNumber: async (shipmentNumber) => {
    const { data, error } = await supabase.from('shipment').select(`
      *,
      origin:locations!origin_location_id(id, code, name),
      destination:locations!destination_location_id(id, code, name)
    `).eq('shipment_number', shipmentNumber).single();
    if (error) throw error;
    return data;
  },

  create: async (originLocationId, destinationLocationId, options = {}) => {
    const { data, error } = await supabase.rpc('create_shipment', {
      p_origin_location_id: originLocationId,
      p_destination_location_id: destinationLocationId,
      p_carrier: options.carrier || null,
      p_expected_delivery_date: options.expectedDeliveryDate || null,
      p_notes: options.notes || null,
      p_created_by: options.createdBy || null
    });
    if (error) throw error;
    return data;
  },

  addItems: async (shipmentId, itemType, itemIds) => {
    const { data, error } = await supabase.rpc('add_items_to_shipment', {
      p_shipment_id: shipmentId,
      p_item_type: itemType,
      p_item_ids: itemIds
    });
    if (error) throw error;
    return data;
  },

  removeItem: async (shipmentId, itemType, itemId) => {
    const { error } = await supabase.from('shipment_item')
      .delete()
      .eq('shipment_id', shipmentId)
      .eq('item_type', itemType)
      .eq('item_id', itemId);
    if (error) throw error;
    return true;
  },

  getItems: async (shipmentId) => {
    const { data, error } = await supabase.rpc('get_shipment_items', {
      p_shipment_id: shipmentId
    });
    if (error) throw error;
    return data;
  },

  dispatch: async (shipmentId, options = {}) => {
    const { data, error } = await supabase.rpc('dispatch_shipment', {
      p_shipment_id: shipmentId,
      p_vehicle_number: options.vehicleNumber || null,
      p_driver_name: options.driverName || null,
      p_driver_contact: options.driverContact || null
    });
    if (error) throw error;
    return data;
  },

  receive: async (shipmentId, receivedBy = null) => {
    const { data, error } = await supabase.rpc('receive_shipment', {
      p_shipment_id: shipmentId,
      p_received_by: receivedBy
    });
    if (error) throw error;
    return data;
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from('shipment')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  cancel: async (id) => {
    const { data, error } = await supabase.from('shipment')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getCountsByStatus: async () => {
    const { data, error } = await supabase.from('shipment').select('status');
    if (error) throw error;

    const counts = {};
    data.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }
};

export const OrdersAPI = {
  listPending: async () => {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('status', 'PENDING')
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data;
  },
  getLines: async (orderId) => {
    const { data, error } = await supabase
      .from('sales_order_lines')
      .select(`
        *,
        material:materials(*)
      `)
      .eq('order_id', orderId);
    if (error) throw error;
    return data;
  }
};

// --- Helpers ---

const transformMaterial = (m) => {
  const images = (m.material_image || []).map(img => ({ id: img.id, url: img.url, type: img.type }));
  const mainImage = images.find(img => img.type === 'MAIN')?.url || images[0]?.url || 'https://via.placeholder.com/600x400?text=No+Image';
  
  return {
    id: m.id,
    code: m.code,
    materialCode: m.code,
    name: m.name,
    materialName: m.name,
    description: m.description,
    type: m.type,
    category: m.category,
    materialGroup: m.category,
    baseUom: m.base_uom,
    baseUOM: m.base_uom,
    isBatchManaged: m.is_batch_managed,
    isSerialManaged: m.is_serial_managed,
    isSerialized: m.is_serial_managed,
    shelfLifeDays: m.shelf_life_days,
    minStock: m.min_stock,
    maxStock: m.max_stock,
    grossWeight: m.gross_weight,
    netWeight: m.net_weight,
    netWeightKg: m.net_weight,
    weightUom: m.weight_uom || 'KG',
    length: m.length,
    width: m.width,
    height: m.height,
    dimensionUom: m.dimension_uom || 'MM',
    isHazmat: m.is_hazmat,
    isHazardous: m.is_hazmat,
    hazmatClass: m.hazmat_class,
    unNumber: m.un_number,
    status: m.status,
    images: images,
    mainImage: mainImage,
    handlingParameter: m.handling_parameter?.[0] || {
        temperatureMin: m.temp_min || '',
        temperatureMax: m.temp_max || '',
        hazardousClass: m.hazmat_class || ''
    }
  };
};

const transformLocation = (l) => ({
  id: l.id,
  code: l.code,
  name: l.name,
  type: l.type,
  category: l.category,
  parentId: l.parent_id,
  address: l.address_line1,
  status: l.status
});
