import { createClient } from '@supabase/supabase-js';

// NOTE: Ideally these should be in .env, but for local setup simple bypass is used.
const supabaseUrl = 'https://dmrrxnxwkibwegsmcjsz.supabase.co';
const supabaseAnonKey = 'sb_publishable_mksAzd1TfeDxGpdQvnegFQ_M53qSjPs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
