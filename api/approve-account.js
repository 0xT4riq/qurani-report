import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'User name is required.' });
    }

    const { data, error } = await supabase
      .from('accounts')
      .update({ approved: true })
      .eq('name', name)
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User ${name} approved.` });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}