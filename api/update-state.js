// api/update-state.js
import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, wilayah } = req.body;

  // Validation
  if (!name || !wilayah) {
    return res.status(400).json({ message: 'بيانات غير كاملة' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ wilayah })
      .eq('name', name)
      .select()
      .single();

    if (error) {
      console.error('Failed to update wilayah:', error);
      return res.status(500).json({ message: 'فشل حفظ الولاية' });
    }

    return res.json({
      message: 'تم حفظ الولاية بنجاح',
      user: data
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'خطأ غير متوقع' });
  }
}
