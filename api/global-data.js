import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  // Handle GET request to retrieve global data
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('global_data')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to fetch global data:', error);
      return res.status(500).json({ error: 'فشل تحميل البيانات' });
    }

    res.json(data);
  }

  // Handle PUT request to update global data
  else if (req.method === 'PUT') {
    const newData = req.body;

    if (!newData.weeks || !newData.surahs || !newData.reportchecklist) {
      return res.status(400).json({ error: 'بيانات غير كاملة' });
    }

    const { data, error } = await supabase
      .from('global_data')
      .update({
        weeks: newData.weeks,
        surahs: newData.surahs,
        reportchecklist: newData.reportchecklist
      })
      .eq('id', 1)
      .select();

    if (error) {
      console.error('Failed to update global data:', error);
      return res.status(500).json({ error: 'فشل حفظ البيانات' });
    }

    res.json({ message: 'تم تحديث البيانات بنجاح', data: data[0] });
  }

  // Return an error for unsupported HTTP methods
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}