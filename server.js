const express = require('express');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const multer = require('multer');
const unzipper = require('unzipper');
const app = express();
const globalDataPath = path.join(__dirname, 'globalData.json');
const PORT = 3000;

// Middleware to parse JSON in POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read JSON file
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return [];
  }
}

// Helper function to write JSON file
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// API to get all accounts (for admin)
app.get('/api/accounts', (req, res) => {
    let accounts = readJSON('accounts.json');
  const { approved, isAdmin } = req.query;

  if (approved !== undefined) {
    const approvedBool = approved === 'true';
    accounts = accounts.filter(acc => acc.approved === approvedBool);
  }

  if (isAdmin !== undefined) {
    const isAdminBool = isAdmin === 'true';
    accounts = accounts.filter(acc => acc.isAdmin === isAdminBool);
  }

  res.json(accounts);
});
// PUT /api/accounts/:name/approve
app.put('/api/accounts/:name/approve', (req, res) => {
  const name = req.params.name;
  const accounts = readJSON('accounts.json');
  const user = accounts.find(acc => acc.name === name);
  if (user) {
    user.approved = true;
    writeJSON('accounts.json', accounts);
    return res.json({ success: true, message: `User ${name} approved.` });
  }
  res.status(404).json({ success: false, message: 'User not found.' });
});

// DELETE /api/accounts/:name
app.delete('/api/accounts/:name', (req, res) => {
  const name = req.params.name;
  let accounts = readJSON('accounts.json');
  const userIndex = accounts.findIndex(acc => acc.name === name);
  if (userIndex !== -1) {
    accounts.splice(userIndex, 1);
    writeJSON('accounts.json', accounts);

    // أيضا حذف كل تقارير هذا المستخدم من reports.json
    let reports = readJSON('reports.json');
    reports = reports.filter(report => report.name !== name);
    writeJSON('reports.json', reports);

    return res.json({ success: true, message: `User ${name} and their reports deleted.` });
  }
  res.status(404).json({ success: false, message: 'User not found.' });
});
// API to get all reports (for admin)
app.get('/api/reports', (req, res) => {
  let reports = readJSON('reports.json');

  // Get filters from query params
  const { name, week, surah } = req.query;

  if (name) {
    const lowerName = name.toLowerCase();
    reports = reports.filter(r => r.name.toLowerCase().includes(lowerName));
  }
  if (week) {
    reports = reports.filter(r => r.week === week);
  }
  if (surah) {
    reports = reports.filter(r => r.surah === surah);
  }

  res.json(reports);
});

app.put('/api/reports/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const reports = readJSON('reports.json');
  const index = reports.findIndex(r => r._id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  // Update fields (only those provided)
  reports[index] = { ...reports[index], ...updatedData };

  writeJSON('reports.json', reports);
  res.json({ success: true, message: 'Report updated successfully' });
});

const { v4: uuidv4 } = require('uuid'); // Install uuid package

// In POST /api/report:
app.post('/api/report', (req, res) => {
  const reports = readJSON('reports.json');
  const newReport = req.body;
    const alreadySent = reports.find(r =>
    r.name === newReport.name && r.week === newReport.week
    );

  if (alreadySent) {
    return res.status(400).json({
      success: false,
      message: 'لقد قمت بإرسال تقرير لهذا الأسبوع مسبقًا.'
    });
  }
  newReport._id = uuidv4(); // Add unique ID
  reports.push(newReport);
  writeJSON('reports.json', reports);
  res.json({ success: true, message: 'تم إرسال التقرير', id: newReport._id });
});

// API to approve account (admin action)
app.post('/api/approve-account', (req, res) => {
  const { name } = req.body;
  const accounts = readJSON('accounts.json');
  const user = accounts.find(acc => acc.name === name);
  if (user) {
    user.approved = true;
    writeJSON('accounts.json', accounts);
    return res.json({ success: true, message: `User ${name} approved.` });
  }
  res.status(404).json({ success: false, message: 'User not found.' });
});
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  const accounts = readJSON('accounts.json');
  const user = accounts.find(acc => acc.name === name && acc.password === password && acc.approved === true);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json(user);
});
app.post('/api/register', (req, res) => {
  const { name, password, joinedSurah } = req.body;

  if (!name || !password || !joinedSurah) {
    return res.status(400).json({ success: false, message: 'الاسم وكلمة المرور و السورة مطلوب.' });
  }

  const accounts = readJSON('accounts.json');

  // تحقق إذا المستخدم موجود
  const exists = accounts.some(acc => acc.name === name);
  if (exists) {
    return res.status(409).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً.' });
  }

  const newUser = {
    name,
    password,
    joinedSurah,
    approved: false,
    isAdmin: false
  };

  accounts.push(newUser);
  writeJSON('accounts.json', accounts);

  res.status(201).json({ success: true, message: 'تم التسجيل بنجاح. يرجى انتظار الموافقة.' });
});

app.get('/api/global-data', (req, res) => {
  const filePath = path.join(__dirname,'globalData.json'); // ← عدل المسار حسب مكان الملف
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('فشل قراءة ملف globalData.json:', err);
      return res.status(500).json({ error: 'فشل تحميل البيانات' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});
app.put('/api/global-data', (req, res) => {
  const newData = req.body;

  // ممكن تضيف تحقق هنا مثل التأكد من وجود الأسابيع والسور والتشيكليست
  if (!newData.weeks || !newData.surahs || !newData.reportChecklist) {
    return res.status(400).json({ error: 'بيانات غير كاملة' });
  }

  fs.writeFile(globalDataPath, JSON.stringify(newData, null, 2), (err) => {
    if (err) {
      console.error('فشل حفظ ملف globalData.json:', err);
      return res.status(500).json({ error: 'فشل حفظ البيانات' });
    }
    res.json({ message: 'تم تحديث البيانات بنجاح' });
  });
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

app.post('/api/update-account', (req, res) => {
  const { oldName, newName, newPassword } = req.body;

  const accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf-8'));

  const user = accounts.find(u => u.name === oldName);
  if (!user) {
    return res.json({ success: false, message: 'المستخدم غير موجود' });
  }

  // تحديث الاسم وكلمة المرور فقط
  user.name = newName;
  user.password = newPassword;

  fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2), 'utf-8');

  res.json({ success: true });
});




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
