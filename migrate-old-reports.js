// migrate-old-reports.js
import { supabase } from './supabaseClient.js';

async function assignWilayahToOldReports() {
  const { data: users } = await supabase.from('accounts').select('name, wilayah');
  const { data: reports } = await supabase
    .from('reports')
    .select('id, name')
    .is('wilayah', null); // only reports without wilayah

  for (const report of reports) {
    const user = users.find(u => u.name === report.name);
    if (user?.wilayah) {
      await supabase.from('reports').update({ wilayah: user.wilayah }).eq('id', report.id);
    }
  }

  console.log('✅ Finished assigning wilayah to past reports');
}

assignWilayahToOldReports();
