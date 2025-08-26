import { supabase } from '../../supabaseClient.js';

export default async function handler(req, res) {
  const { name } = req.query; // Get the user's name from the URL

  if (req.method === 'PUT') {
    // Logic for PUT /api/accounts/:name/approve
    const { data, error } = await supabase
      .from('accounts')
      .update({ approved: true })
      .eq('name', name)
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User ${name} approved.` });
  } else if (req.method === 'DELETE') {
    // Logic for DELETE /api/accounts/:name
    const { error: reportsError } = await supabase
      .from('reports')
      .delete()
      .eq('name', name);

    if (reportsError) {
      console.error('API Error:', reportsError);
      return res.status(500).json({ error: reportsError.message });
    }

    const { data, error } = await supabase
      .from('accounts')
      .delete()
      .eq('name', name)
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User ${name} and their reports deleted.` });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}