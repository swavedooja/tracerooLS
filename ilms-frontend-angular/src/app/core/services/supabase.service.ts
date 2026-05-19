import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;

  private readonly supabaseUrl = 'https://dmrrxnxwkibwegsmcjsz.supabase.co';
  private readonly supabaseAnonKey = 'sb_publishable_mksAzd1TfeDxGpdQvnegFQ_M53qSjPs';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
        flowType: 'pkce'
      }
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
