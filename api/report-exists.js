import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { name, week, surah } = req.query;

    if (!name || !week || !surah) {
      return res.status(400).json({ success: false, message: 'Missing parameters.' });
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('name', name)
      .eq('week', week)
      .eq('surah', surah);

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // If data.length is greater than 0, a report exists.
    res.json({ exists: data && data.length > 0 });
  } else {
    // Return a 405 Method Not Allowed for other methods.
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}