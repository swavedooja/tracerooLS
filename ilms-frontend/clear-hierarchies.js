const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ'; // Note: In production, use service_role key for seeding

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
    console.log('--- Starting Hierarchy Cleanup ---');

    console.log('Clearing old levels...');
    const { error: errL } = await supabase.from('packaging_level').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errL) console.error('Error clearing levels:', errL.message);

    console.log('Clearing old hierarchies...');
    const { error: errH } = await supabase.from('packaging_hierarchy').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errH) console.error('Error clearing hierarchies:', errH.message);

    console.log('--- Hierarchy Cleanup Complete ---');
}

clearData();
