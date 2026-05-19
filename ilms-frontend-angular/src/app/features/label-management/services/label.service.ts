import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LabelTemplate, PackagingHierarchy, PackagingLevel } from '../../../core/models/label.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.client;
  }

  // ===============================
  // Orders API (Moving here as it relates to printing)
  // ===============================
  async getPendingOrders() {
    const { data, error } = await this.supabase
      .from('sales_orders')
      .select('*')
      .neq('status', 'SHIPPED')
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getOrderLines(orderId: string) {
    const { data, error } = await this.supabase
      .from('sales_order_lines')
      .select(`*, material:materials(*)`)
      .eq('order_id', orderId);
    if (error) throw error;
    return data;
  }

  // ===============================
  // Label Templates API
  // ===============================
  async getLabelTemplates(): Promise<LabelTemplate[]> {
    const { data, error } = await this.supabase
      .from('label_templates')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getLabelTemplate(id: string): Promise<LabelTemplate> {
    const { data, error } = await this.supabase
      .from('label_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createLabelTemplate(payload: any): Promise<LabelTemplate> {
    const { data, error } = await this.supabase
      .from('label_templates')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateLabelTemplate(id: string, payload: any): Promise<LabelTemplate> {
    const { data, error } = await this.supabase
      .from('label_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ===============================
  // Packaging API
  // ===============================
  async getHierarchies(materialCode: string | null = null): Promise<PackagingHierarchy[]> {
    let query = this.supabase.from('packaging_hierarchy').select('*');
    if (materialCode) {
      query = query.ilike('name', `%${materialCode}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createHierarchy(item: any): Promise<PackagingHierarchy> {
    const { data, error } = await this.supabase.from('packaging_hierarchy').insert([item]).select().single();
    if (error) throw error;
    return data;
  }

  async getLevels(hierarchyId: string): Promise<PackagingLevel[]> {
    const { data, error } = await this.supabase.from('packaging_level')
      .select(`*, label_template:label_templates(*)`)
      .eq('hierarchy_id', hierarchyId)
      .order('level_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createLevel(item: any): Promise<PackagingLevel> {
    const { data, error } = await this.supabase.from('packaging_level').insert([item]).select().single();
    if (error) throw error;
    return data;
  }

  async updateLevel(id: string, item: any): Promise<PackagingLevel> {
    const { data, error } = await this.supabase.from('packaging_level').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteLevel(id: string): Promise<void> {
    const { error } = await this.supabase.from('packaging_level').delete().eq('id', id);
    if (error) throw error;
  }
}
