const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
