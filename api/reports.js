// api/reports.js
import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { name, week, surah } = req.query;

    let query = supabase.from('reports').select('*');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (week) {
      query = query.eq('week', week);
    }
    if (surah) {
      query = query.eq('surah', surah);
    }

    const { data, error } = await query;

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json(data);
  } else {
    // Return a 405 Method Not Allowed error for other methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}