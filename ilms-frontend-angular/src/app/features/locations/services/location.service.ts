import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Location } from '../../../core/models/location.model';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.client;
  }

  async getRoots(): Promise<Location[]> {
    const { data, error } = await this.supabase.from('locations').select('*').is('parent_id', null);
    if (error) throw error;
    return data.map(this.transformLocation);
  }

  async getChildren(parentId: string): Promise<Location[]> {
    const { data, error } = await this.supabase.from('locations').select('*').eq('parent_id', parentId);
    if (error) throw error;
    return data.map(this.transformLocation);
  }

  async getLocation(code: string): Promise<Location> {
    const { data, error } = await this.supabase.from('locations').select('*').eq('code', code).single();
    if (error) throw error;
    return this.transformLocation(data);
  }

  async createLocation(item: any): Promise<Location> {
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

  async updateLocation(code: string, item: any): Promise<Location> {
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

  private transformLocation(l: any): Location {
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
}
