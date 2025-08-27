// api/reports.js
import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { name, week, surah } = req.query;

    let query = supabase.from('reports').select('*');

    if (name) query = query.eq('name', name);
    if (week) query = query.eq('week', week);
    if (surah) query = query.eq('surah', surah);

    const { data, error } = await query;

    if (error) {
      console.error('API Error: ', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json(data);

  } else if (req.method === 'POST') {
    const newReport = req.body;

    const { data: exists } = await supabase
      .from('reports')
      .select('*')
      .eq('name', newReport.name)
      .eq('week', newReport.week);

    if (exists && exists.length > 0) {
      return res.status(400).json({ success: false, message: 'لقد قمت بإرسال تقرير لهذا الأسبوع مسبقًا.' });
    }

    const { error } = await supabase.from('reports').insert([newReport]);
    if (error) {
      console.error('API Error: ', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, message: 'تم إرسال التقرير' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}