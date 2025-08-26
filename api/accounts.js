import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  // Check if the request method is GET.
  if (req.method === 'GET') {
    let query = supabase.from('accounts').select('*');

    // Filtering by 'approved' status
    if (req.query.approved !== undefined) {
      const approvedBool = req.query.approved === 'true';
      query = query.eq('approved', approvedBool);
    }

    // Filtering by 'isAdmin' status
    if (req.query.isadmin !== undefined) {
      const isAdminBool = req.query.isadmin === 'true';
      query = query.eq('isadmin', isAdminBool);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(accounts);
  } else {
    // Return a 405 Method Not Allowed error for other methods.
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}