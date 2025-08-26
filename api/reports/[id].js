import { supabase } from '../../supabaseClient.js';

export default async function handler(req, res) {
  const { id } = req.query; 

  if (req.method === 'GET') {
    // Logic for GET /api/reports/:id
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json(data);
  } 
  
  else if (req.method === 'PUT') {
    // Logic for PUT /api/reports/:id
    const updatedData = req.body;
    const { data, error } = await supabase
      .from('reports')
      .update(updatedData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report updated successfully', report: data[0] });
  } 
  
  else if (req.method === 'DELETE') {
    // Logic for DELETE /api/reports/:id
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } 
  
  else {
    // Return a 405 Method Not Allowed for any other methods.
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}