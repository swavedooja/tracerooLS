import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Material } from '../../../core/models/material.model';
import { InventoryItem } from '../../../core/models/inventory.model';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.client;
  }

  async getMaterials(): Promise<Material[]> {
    const { data, error } = await this.supabase.from('materials').select(`*, material_image(*)`);
    if (error) throw error;
    return data.map(this.transformMaterial);
  }

  async getMaterial(code: string): Promise<Material> {
    const { data, error } = await this.supabase.from('materials').select(`*, material_image(*), handling_parameter(*)`).eq('code', code).single();
    if (error) throw error;
    return this.transformMaterial(data);
  }

  async createMaterial(item: any): Promise<Material> {
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

  async updateMaterial(code: string, item: any): Promise<Material> {
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

  async getInventory(filters: any = {}): Promise<InventoryItem[]> {
    let query = this.supabase.from('inventory').select(`
      *,
      material:materials(id, code, name),
      location:location_id(id, code, name)
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

  private transformMaterial(m: any): Material {
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

  private transformInventoryItem(i: any): InventoryItem {
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
}
