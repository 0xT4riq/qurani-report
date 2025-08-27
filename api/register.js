import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, password, joinedSurah } = req.body;

    if (!name || !password || !joinedSurah) {
      return res.status(400).json({ success: false, message: 'الاسم وكلمة المرور و السورة مطلوب.' });
    }

    // Check if user exists
    const { data: existing, error: checkError } = await supabase
      .from('accounts')
      .select('name')
      .eq('name', name);

    if (checkError) {
      console.error('API Error:', checkError);
      return res.status(500).json({ success: false, message: checkError.message });
    }
    
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً.' });
    }

    // Insert new user
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ name, password, joinedSurah, approved: false, isadmin: false }])
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, message: 'تم التسجيل بنجاح. سيقوم المشرف بموافقتك في اقرب وقت', user: data[0] });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}