// api/login.js
import { supabase } from '../supabaseClient.js'; // Adjust the path as needed

// The handler function is the entry point for the Vercel serverless function
export default async function handler(req, res) {
  // Vercel routes all requests to this handler, so you must check the HTTP method
  if (req.method === 'POST') {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: 'Name and password are required.' });
    }

    const { data, error } = await supabase
        .from('accounts')
        .select('name, "isAdmin", approved')
        .eq('name', name)
        .eq('password', password)
        .eq('approved', true);

    if (error) {
        console.error('Login database error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }

    if (!data || data.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials or account not approved.' });
    }

    const user = data[0]; 
    res.json({
        message: 'Login successful',
        user: {
            name: user.name,
            isAdmin: user.isAdmin,
            approved: user.approved
        }
    });
  } else {
    // Return a 405 error for any other method besides POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}