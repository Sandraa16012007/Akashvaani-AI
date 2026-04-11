const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debug() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  
  if (!url || !key) {
    console.log('MISSING ENV VARS');
    return;
  }

  const supabase = createClient(url, key);
  
  const { data: apps } = await supabase.from('applications').select('*').limit(1);
  const { data: schemes } = await supabase.from('schemes').select('*').limit(1);
  
  console.log('APP_SAMPLE:', apps?.[0] ? Object.keys(apps[0]) : 'NONE');
  console.log('SCHEME_SAMPLE:', schemes?.[0] ? Object.keys(schemes[0]) : 'NONE');
  
  if (apps?.[0] && schemes?.[0]) {
      console.log('APP_SCHEME_ID:', apps[0].scheme_id);
      console.log('SCHEME_ID:', schemes[0].id);
  }
}

debug();
