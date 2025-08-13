const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '142742480340-cue4k3r47a81su0qa9k2mcejerir18uc.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('Visit this URL in your browser:\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nEnter the code from the page here: ', async (code) => {
  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  console.log('✅ Your tokens:\n', tokens);
});
