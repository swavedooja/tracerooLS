import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

/** Utility for UUID generation for inserts requiring manual UUIDs */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private supabaseService: SupabaseService) { }

  private get supabase() {
    return this.supabaseService.client;
  }

  // ===============================
  // Materials API
  // ===============================
  async getMaterials(): Promise<any[]> {
    const { data, error } = await this.supabase.from('materials').select(`*, material_image(*)`);
    if (error) throw error;
    return data.map(this.transformMaterial);
  }

  async getMaterial(code: string): Promise<any> {
    const { data, error } = await this.supabase.from('materials').select(`*, material_image(*), handling_parameter(*)`).eq('code', code).single();
    if (error) throw error;
    return this.transformMaterial(data);
  }

  async createMaterial(item: any): Promise<any> {
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
    const { data, error } = await this.supabase.from('materials').insert([payload]).select().single();
    if (error) throw error;
    return this.transformMaterial(data);
  }

  async updateMaterial(code: string, item: any): Promise<any> {
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
    const { data, error } = await this.supabase.from('materials').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return this.transformMaterial(data);
  }

  async removeMaterial(code: string): Promise<void> {
    const { error } = await this.supabase.from('materials').delete().eq('code', code);
    if (error) throw error;
  }

  private transformMaterial(m: any): any {
    if (!m) return m;
    let baseImageUrl = null;
    let images = [];
    if (m.material_image && m.material_image.length > 0) {
      images = m.material_image.sort((a: any, b: any) => a.sequence - b.sequence);
      baseImageUrl = images.find((i: any) => i.is_primary)?.image_url || images[0].image_url;
    }
    return {
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      type: m.type,
      category: m.category,
      baseUom: m.base_uom,
      isBatchManaged: m.is_batch_managed,
      isSerialManaged: m.is_serial_managed,
      shelfLifeDays: m.shelf_life_days,
      minStock: m.min_stock,
      maxStock: m.max_stock,
      grossWeight: m.gross_weight,
      netWeight: m.net_weight,
      weightUom: m.weight_uom,
      length: m.length,
      width: m.width,
      height: m.height,
      dimensionUom: m.dimension_uom,
      isHazmat: m.is_hazmat,
      hazmatClass: m.hazmat_class,
      unNumber: m.un_number,
      status: m.status,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      imageUrl: baseImageUrl,
      images: images,
      handlingParameters: m.handling_parameter || []
    };
  }

  // ===============================
  // Location API
  // ===============================
  async getRoots(): Promise<any[]> {
    const { data, error } = await this.supabase.from('locations').select('*').is('parent_id', null);
    if (error) throw error;
    return data.map(this.transformLocation);
  }

  async getChildren(parentId: string): Promise<any[]> {
    const { data, error } = await this.supabase.from('locations').select('*').eq('parent_id', parentId);
    if (error) throw error;
    return data.map(this.transformLocation);
  }

  async getLocation(code: string): Promise<any> {
    const { data, error } = await this.supabase.from('locations').select('*').eq('code', code).single();
    if (error) throw error;
    return this.transformLocation(data);
  }

  async createLocation(item: any): Promise<any> {
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
    const { data, error } = await this.supabase.from('locations').insert([payload]).select().single();
    if (error) throw error;
    return this.transformLocation(data);
  }

  async updateLocation(code: string, item: any): Promise<any> {
    const payload = {
      name: item.name,
      type: item.type,
      category: item.category,
      parent_id: item.parentId,
      address_line1: item.address,
      status: item.status
    };
    const { data, error } = await this.supabase.from('locations').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return this.transformLocation(data);
  }

  async removeLocation(code: string): Promise<void> {
    const { error } = await this.supabase.from('locations').delete().eq('code', code);
    if (error) throw error;
  }

  private transformLocation(l: any): any {
    if (!l) return l;
    return {
      id: l.id,
      code: l.code,
      name: l.name,
      type: l.type,
      category: l.category,
      parentId: l.parent_id,
      address: l.address_line1,
      status: l.status
    };
  }

  // ===============================
  // Inventory/Dashboard counts (Partial)
  // ===============================
  // ===============================
  // Inventory API
  // ===============================
  async getInventory(filters: any = {}): Promise<any[]> {
    let query = this.supabase.from('inventory').select(`
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
    return data.map(this.transformInventoryItem);
  }

  async markAsPrinted(ids: string[]): Promise<any> {
    const { data, error } = await this.supabase.from('inventory')
      .update({ label_printed: 'Y' })
      .in('id', ids)
      .select();
    if (error) throw error;
    return data;
  }

  async getInventoryCountsByStatus(): Promise<any> {
    const { data, error } = await this.supabase.from('inventory').select('status');
    if (error) throw error;
    const counts: any = {};
    data.forEach((item: any) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }

  private transformInventoryItem(i: any): any {
    if (!i) return i;
    return {
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
      labelPrinted: i.label_printed,
      createdAt: i.created_at
    };
  }
  
  // ===============================
  // Dashboard API (Mocked for Migration)
  // ===============================
  async getMetrics(): Promise<any> {
    return {
      total_inventory_count: 12500,
      active_inventory_count: 8200,
      packed_count: 3100,
      shipped_count: 1200,
      box_count: 450,
      pallet_count: 120,
      reserved_serials: 5000,
      consumed_serials: 18000,
      pre_inventory_count: 150,
      sealed_containers: 200
    };
  }

  async getInventoryByStage(): Promise<any[]> {
    return [
      { stage: 'PRE_INVENTORY', count: 150, percentage: 5 },
      { stage: 'ACTIVE', count: 8200, percentage: 65 },
      { stage: 'PACKED', count: 3100, percentage: 20 },
      { stage: 'SHIPPED', count: 1050, percentage: 10 }
    ];
  }

  async getAlerts(limit: number): Promise<any[]> {
    return [
      { severity: 'WARNING', description: 'Low stock on Amoxicillin', reference: 'MAT-001', timestamp: new Date().toISOString() },
      { severity: 'ERROR', description: 'QC Failed for Batch BX-99', reference: 'BAT-099', timestamp: new Date().toISOString() }
    ];
  }

  async getRecentEvents(limit: number): Promise<any[]> {
    return [
      { event_type: 'Item Packed', status: 'SUCCESS', created_at: new Date().toISOString(), inventory: { serial_number: 'SN-00123' } },
      { event_type: 'Label Printed', status: 'SUCCESS', created_at: new Date().toISOString(), inventory: { serial_number: 'SN-00124' } }
    ];
  }

  // ===============================
  // Packaging API
  // ===============================
  async getHierarchies(materialCode: string | null = null): Promise<any[]> {
    let query = this.supabase.from('packaging_hierarchy').select('*');
    if (materialCode) {
      query = query.ilike('name', `%${materialCode}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createHierarchy(item: any): Promise<any> {
    const { data, error } = await this.supabase.from('packaging_hierarchy').insert([item]).select().single();
    if (error) throw error;
    return data;
  }

  async getLevels(hierarchyId: string): Promise<any[]> {
    const { data, error } = await this.supabase.from('packaging_level')
      .select(`*, label_template:label_templates(*)`)
      .eq('hierarchy_id', hierarchyId)
      .order('level_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createLevel(item: any): Promise<any> {
    const { data, error } = await this.supabase.from('packaging_level').insert([item]).select().single();
    if (error) throw error;
    return data;
  }

  async updateLevel(id: string, item: any): Promise<any> {
    const { data, error } = await this.supabase.from('packaging_level').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteLevel(id: string): Promise<void> {
    const { error } = await this.supabase.from('packaging_level').delete().eq('id', id);
    if (error) throw error;
  }

  // ===============================
  // Master Definitions API
  // ===============================
  async getMasterDefinitions(): Promise<any[]> {
    const { data, error } = await this.supabase.from('master_definitions').select('*');
    if (error) throw error;
    return data;
  }
}
