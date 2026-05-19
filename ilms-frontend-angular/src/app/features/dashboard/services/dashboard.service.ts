import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { DashboardMetrics, InventoryStage, DashboardAlert, DashboardEvent } from '../../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.client;
  }

  async getMetrics(): Promise<DashboardMetrics> {
    // Current mock in ApiService
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

  async getInventoryByStage(): Promise<InventoryStage[]> {
    return [
      { stage: 'PRE_INVENTORY', count: 150, percentage: 5 },
      { stage: 'ACTIVE', count: 8200, percentage: 65 },
      { stage: 'PACKED', count: 3100, percentage: 20 },
      { stage: 'SHIPPED', count: 1050, percentage: 10 }
    ];
  }

  async getAlerts(limit: number): Promise<DashboardAlert[]> {
    return [
      { severity: 'WARNING', description: 'Low stock on Amoxicillin', reference: 'MAT-001', timestamp: new Date().toISOString() },
      { severity: 'ERROR', description: 'QC Failed for Batch BX-99', reference: 'BAT-099', timestamp: new Date().toISOString() }
    ];
  }

  async getRecentEvents(limit: number): Promise<DashboardEvent[]> {
    return [
      { event_type: 'Item Packed', status: 'SUCCESS', created_at: new Date().toISOString(), inventory: { serial_number: 'SN-00123' } },
      { event_type: 'Label Printed', status: 'SUCCESS', created_at: new Date().toISOString(), inventory: { serial_number: 'SN-00124' } }
    ];
  }

  async getMasterDefinitions(): Promise<any[]> {
    const { data, error } = await this.supabase.from('master_definitions').select('*');
    if (error) throw error;
    return data;
  }
}
