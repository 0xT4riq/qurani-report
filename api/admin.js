import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  // Use a switch statement to handle different request methods
  switch (req.method) {
    case 'GET':
      // Handler for fetching account data
      return handleGetAccounts(req, res);
    case 'PUT':
      // Handler for approving an account
      return handleApproveAccount(req, res);
    default:
      // Return a 405 Method Not Allowed error for any other methods
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handler function for GET requests
const handleGetAccounts = async (req, res) => {
  let query = supabase.from('accounts').select('*');

  // Filtering by 'approved' status
  if (req.query.approved !== undefined) {
    const approvedBool = req.query.approved === 'true';
    query = query.eq('approved', approvedBool);
  }

  // Filtering by 'isadmin' status
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
};

// Handler function for POST requests
const handleApproveAccount = async (req, res) => {
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
};