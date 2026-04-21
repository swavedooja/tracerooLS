import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // NOTE: Ideally these should be in environments/environment.ts
  private readonly supabaseUrl = 'https://dmrrxnxwkibwegsmcjsz.supabase.co';
  private readonly supabaseAnonKey = 'sb_publishable_mksAzd1TfeDxGpdQvnegFQ_M53qSjPs';

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
