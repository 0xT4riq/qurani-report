import { supabase } from '../supabaseClient.js';

// The main handler for the serverless function
export default async function handler(req, res) {
  // Use a URL object to parse the path from the request
  const url = new URL(req.url, `http://${req.headers.host}`);

  switch (url.pathname) {
    case '/api/login':
      return handleLogin(req, res);
    case '/api/register':
      return handleRegister(req, res);
    default:
      // Return a 404 for any other path
      return res.status(404).json({ success: false, message: 'Not Found' });
  }
}

// Handler for the /api/login endpoint
const handleLogin = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ success: false, message: 'اسم وكلمة المرور مطلوبان' });
  }

  const trimmedName = name.trim();
  const trimmedPassword = password.trim();

  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, state, isadmin')
    .eq('name', trimmedName)
    .eq('password', trimmedPassword)
    .single();

  if (error && error.code === 'PGRST116') {
    return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور خاطئة' });
  }
  
  if (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ داخلي' });
  }

  res.json({
    success: true,
    message: 'تم تسجيل الدخول',
    userId: data.id,
    userName: data.name,
    userState: data.state,
    isAdmin: data.isadmin
  });
};

// Handler for the /api/register endpoint
const handleRegister = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, state, password } = req.body;
  if (!name || !email || !state || !password) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال جميع الخانات' });
  }

  const { data: existingUser, error: checkError } = await supabase
    .from('accounts')
    .select('id')
    .or(`name.eq.${name},email.eq.${email}`);

  if (checkError) {
    console.error('API Error:', checkError);
    return res.status(500).json({ success: false, message: 'حدث خطأ داخلي' });
  }

  if (existingUser && existingUser.length > 0) {
    return res.status(409).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقًا' });
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ name, password, joinedSurah, approved: false, isadmin: false }])
    .select();

  if (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ داخلي' });
  }

  res.status(201).json({ success: true, message: 'تم التسجيل بنجاح', user: data[0] });
};