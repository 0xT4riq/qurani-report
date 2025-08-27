const express = require('express');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const multer = require('multer');
const unzipper = require('unzipper');
const app = express();
const PORT = 3000;
const { google } = require('googleapis');
import { supabase } from './supabaseClient.js'; 
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const FOLDER_ID = process.env.FOLDER_ID;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Middleware to parse JSON in POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

/*
// API to get all accounts (for admin)
app.get('/api/accounts', async (req, res) => {
  let query = supabase.from('accounts').select('*');

  // Filtering by approved
  if (req.query.approved !== undefined) {
    const approvedBool = req.query.approved === 'true';
    query = query.eq('approved', approvedBool);
  }

  // Filtering by isAdmin
  if (req.query.isAdmin !== undefined) {
    const isAdminBool = req.query.isAdmin === 'true';
    query = query.eq('isAdmin', isAdminBool);
  }

  const { data: accounts, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(accounts);
});


// PUT /api/accounts/:name/approve
app.put('/api/accounts/:name/approve', async (req, res) => {
  const name = req.params.name;

  const { data, error } = await supabase
    .from('accounts')
    .update({ approved: true })
    .eq('name', name)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, message: `User ${name} approved.` });
});


// DELETE /api/accounts/:name
app.delete('/api/accounts/:name', async (req, res) => {
  const name = req.params.name;

  // Delete reports first
  const { error: reportsError } = await supabase
    .from('reports')
    .delete()
    .eq('name', name);

  if (reportsError) return res.status(500).json({ error: reportsError.message });

  // Delete account
  const { data, error } = await supabase
    .from('accounts')
    .delete()
    .eq('name', name)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, message: `User ${name} and their reports deleted.` });
});
*/
/*
// In POST /api/report:
app.post('/api/report', async (req, res) => {
  const newReport = req.body;

  // Check duplicate
  const { data: exists } = await supabase
    .from('reports')
    .select('*')
    .eq('name', newReport.name)
    .eq('week', newReport.week);

  if (exists.length > 0) {
    return res.status(400).json({ success: false, message: 'لقد قمت بإرسال تقرير لهذا الأسبوع مسبقًا.' });
  }

  const { error } = await supabase.from('reports').insert([newReport]);
  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, message: 'تم إرسال التقرير' });
});



// API to get all reports (for admin)
app.get('/api/reports', async (req, res) => {
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

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json(data);
});

// UPDATE a report by id
app.put('/api/reports/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const { data, error } = await supabase
    .from('reports')
    .update(updatedData)
    .eq('_id', id)
    .select();

  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });

  res.json({ success: true, message: 'Report updated successfully', report: data[0] });
});

// DELETE a report by id
app.delete('/api/reports/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('reports')
    .delete()
    .eq('_id', id)
    .select();

  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });

  res.json({ success: true, message: 'Report deleted successfully' });
});
const { v4: uuidv4 } = require('uuid'); // Install uuid package

*/
/*
// API to approve account (admin action)
app.post('/api/approve-account', async (req, res) => {
  const { name } = req.body;

  const { data, error } = await supabase
    .from('accounts')
    .update({ approved: true })
    .eq('name', name)
    .select();

  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, message: `User ${name} approved.` });
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;

  const { data, error } = await supabase
    .from('accounts')
    .select('name, "isAdmin", approved')
    .eq('name', name)
    .eq('password', password) // in production, hash passwords!
    .eq('approved', true);

  if (error) return res.status(500).json({ message: error.message });
  if (!data || data.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = data[0]; 
    res.json({
        message: 'Login successful',
        user: {
            name: user.name,
            isAdmin: user.isAdmin,
            approved: user.approved
        }
    });
});

app.post('/api/register', async (req, res) => {
  const { name, password, joinedSurah } = req.body;

  if (!name || !password || !joinedSurah) {
    return res.status(400).json({ success: false, message: 'الاسم وكلمة المرور و السورة مطلوب.' });
  }

  // Check if user exists
  const { data: existing, error: checkError } = await supabase
    .from('accounts')
    .select('name')
    .eq('name', name);

  if (checkError) return res.status(500).json({ success: false, message: checkError.message });
  if (existing && existing.length > 0) {
    return res.status(409).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً.' });
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ name, password, joinedSurah, approved: false, isAdmin: false }])
    .select();

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.status(201).json({ success: true, message: 'تم التسجيل بنجاح. سيقوم المشرف بموافقتك في اقرب وقت', user: data[0] });
});
*/
/*
// GET global data
app.get('/api/global-data', async (req, res) => {
  const { data, error } = await supabase
    .from('global_data')
    .select('*')
    .limit(1)
    .single(); // get only the first row

  if (error) {
    console.error('Failed to fetch global data:', error);
    return res.status(500).json({ error: 'فشل تحميل البيانات' });
  }

  res.json(data);
});

app.put('/api/global-data', async (req, res) => {
  const newData = req.body;

  if (!newData.weeks || !newData.surahs || !newData.reportChecklist) {
    return res.status(400).json({ error: 'بيانات غير كاملة' });
  }

  const { data, error } = await supabase
    .from('global_data')
    .update({
      weeks: newData.weeks,
      surahs: newData.surahs,
      reportChecklist: newData.reportChecklist
    })
    .eq('id', 1) // assuming the single row has id=1
    .select();

  if (error) {
    console.error('Failed to update global data:', error);
    return res.status(500).json({ error: 'فشل حفظ البيانات' });
  }

  res.json({ message: 'تم تحديث البيانات بنجاح', data: data[0] });
});

webpush.setVapidDetails(
  'mailto:you@example.com',
  'BOWP9TLniGm1C2pR7r9yCF4gWxlrxbTZqvCTX1lEK0n3hloeizZ_W3zPXxxkCzesiM788wtiedxG2Iq6VPlAQ64',
  'k-5QT2A3zMm1tJyCHA7Q0ej5lmntj_VHY_H5bNOiTRQ'
);

app.post('/api/save-subscription', express.json(), async (req, res) => {
  const subscription = req.body;
  const subsPath = path.join(__dirname, 'subscriptions.json');
  let subs = [];

  if (fs.existsSync(subsPath)) {
    subs = JSON.parse(fs.readFileSync(subsPath));
  }

  // تحقق إذا الاشتراك موجود مسبقًا
  const exists = subs.find(sub => JSON.stringify(sub) === JSON.stringify(subscription));
  if (!exists) {
    subs.push(subscription);
    fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: "✅ تم الاشتراك بنجاح!",
      body: "سيصلك إشعار التذكير يوم الأربعاء بإذن الله.",
      icon: "logo.png"
    }));
    res.status(201).json({ message: '✅ تم الحفظ وإرسال الإشعار' });
  } catch (err) {
    console.error('فشل الإشعار:', err);
    res.status(500).json({ error: 'تم الحفظ، لكن فشل إرسال الإشعار' });
  }
});
*/
const cron = require('node-cron');
const { sendWednesdayReminder } = require('./reminder');

// الأربعاء - الساعة 9:00 صباحًا
cron.schedule('0 9 * * 3', () => {
  console.log('🔔 تذكير صباح الأربعاء');
  sendWednesdayReminder();
});

// الأربعاء - الساعة 1:00 ظهرًا
cron.schedule('0 13 * * 3', () => {
  console.log('🔔 تذكير ظهر الأربعاء');
  sendWednesdayReminder();
});

// الأربعاء - الساعة 8:00 مساءً
cron.schedule('0 20 * * 3', () => {
  console.log('🔔 تذكير مساء الأربعاء');
  sendWednesdayReminder();
});

//backup endpoint
app.get('/api/export-data', (req, res) => {
  const archive = archiver('zip');
  const zipName = `backup_${new Date().toISOString().split('T')[0]}.zip`;

  res.attachment(zipName);
  archive.pipe(res);

  const files = ['accounts.json', 'reports.json', 'subscriptions.json', 'globalData.json'];
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
    }
  });

  archive.finalize();
});
const upload = multer({ dest: 'uploads/' });

app.post('/api/import-data', upload.single('backup'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const directory = await unzipper.Open.file(filePath);
    for (const file of directory.files) {
      const dest = path.join(__dirname, file.path);
      const writeStream = fs.createWriteStream(dest);
      await new Promise(resolve => file.stream().pipe(writeStream).on('finish', resolve));
    }

    fs.unlinkSync(filePath); // delete uploaded zip after restore
    res.json({ message: '✅ تم استرجاع البيانات بنجاح' });
  } catch (err) {
    console.error('استرجاع فشل:', err);
    res.status(500).json({ error: 'فشل في استيراد البيانات' });
  }
});
/*
app.post('/api/update-account', async (req, res) => {
  const { oldName, newName, newPassword } = req.body;

  // Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('accounts')
    .select('*')
    .eq('name', oldName)
    .single();

  if (fetchError) {
    return res.status(500).json({ success: false, message: fetchError.message });
  }
  if (!user) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }

  // Update name and password
  const { data, error: updateError } = await supabase
    .from('accounts')
    .update({ name: newName, password: newPassword }) // in production, hash passwords!
    .eq('name', oldName)
    .select();

  if (updateError) {
    return res.status(500).json({ success: false, message: updateError.message });
  }

  res.json({ success: true, message: 'تم تحديث الحساب بنجاح', user: data[0] });
});
*/
async function uploadFileToDrive(filePath) {
  try {
    const fileName = `${path.basename(filePath)}-${new Date().toISOString()}`;
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: "application/json",
        body: fs.createReadStream(filePath),
      },
    });
    console.log(`✅ Uploaded: ${fileName} (ID: ${res.data.id})`);
  } catch (err) {
    console.error(`❌ Failed to upload ${filePath}:`, err.message);
  }
}
cron.schedule('0 3 * * *', async () => {
  console.log('⏳ Starting daily backup:', new Date());
  const files = ['globalData.json', 'accounts.json', 'reports.json', 'subscriptions.json'];

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      await uploadFileToDrive(filePath);
    }
  }

  console.log('✅ Backup completed');
});




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
