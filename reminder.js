const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

webpush.setVapidDetails(
  'mailto:you@example.com',
  'BOWP9TLniGm1C2pR7r9yCF4gWxlrxbTZqvCTX1lEK0n3hloeizZ_W3zPXxxkCzesiM788wtiedxG2Iq6VPlAQ64',
  'k-5QT2A3zMm1tJyCHA7Q0ej5lmntj_VHY_H5bNOiTRQ'
);

// كل أربعاء الساعة 9:00 صباحاً
function sendWednesdayReminder() {
  const subsPath = path.join(__dirname, 'subscriptions.json');
  if (!fs.existsSync(subsPath)) return;

  const subscriptions = JSON.parse(fs.readFileSync(subsPath));

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, JSON.stringify({
      title: "تذكير التقرير الأسبوعي",
      body: "اليوم الأربعاء! لا تنسَ تسليم تقريرك ✨",
      icon: "public/logo.png"
    })).catch(console.error);
  });
}

module.exports = { sendWednesdayReminder };
