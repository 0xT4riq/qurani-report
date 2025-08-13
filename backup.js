const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const { google } = require("googleapis");


// ====== CONFIG ======
const FOLDER_ID = "1ihRvTA6DijeOc-QUqfjzEjgliWepIXX1"; // The folder in Google Drive to store backups
const FILES_TO_BACKUP = [
  "globalData.json",
  "accounts.json",
  "reports.json",
  "subscriptions.json",

].map(f => path.join(__dirname, f)); // Adjust paths if needed

// ====== AUTH ======
const CREDENTIALS = JSON.parse(fs.readFileSync("credentials.json"));
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});
const drive = google.drive({ version: "v3", auth });

// ====== UPLOAD FUNCTION ======
async function uploadFile(filePath) {
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
}

// ====== CRON JOB (Runs every day at 10:05 AM) ======
cron.schedule("5 10 * * *", async () => {
  console.log("⏳ Starting backup:", new Date());
  for (let file of FILES_TO_BACKUP) {
    await uploadFile(file);
  }
});
