import { supabase } from '../supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { oldName, newName, newPassword } = req.body;

    if (!oldName) {
      return res.status(400).json({ success: false, message: 'Current user name is required.' });
    }
    
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('name', oldName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is for 'not found'
      console.error('API Error:', fetchError);
      return res.status(500).json({ success: false, message: fetchError.message });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // Prepare the update object
    const updateData = {};
    if (newName) {
      updateData.name = newName;
    }
    if (newPassword) {
      updateData.password = newPassword; // Remember to hash passwords in a real app!
    }

    // Only proceed with the update if there is data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided for update.' });
    }

    // Update the account
    const { data, error: updateError } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('name', oldName)
      .select();

    if (updateError) {
      console.error('API Error:', updateError);
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: 'تم تحديث الحساب بنجاح', user: data[0] });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}