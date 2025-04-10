// Get the canvas element
const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');

// Set the canvas dimensions
wheelCanvas.width = 400;
wheelCanvas.height = 400;

// Define the wheel segments
const segments = [
  { name: 'Segment 1', color: '#FF0000', reward: 10 },
  { name: 'Segment 2', color: '#00FF00', reward: 20 },
  { name: 'Segment 3', color: '#0000FF', reward: 30 },
  { name: 'Segment 4', color: '#FFFF00', reward: 40 },
  { name: 'Segment 5', color: '#FF00FF', reward: 50 },
];

// Define the wheel rotation
let rotation = 0;

// Define the spin button
const spinButton = document.getElementById('spin-button');

// Define the result element
const resultElement = document.getElementById('result');

// Define the coins element
const coinsElement = document.getElementById('coins');

// Define the leaderboard element
const leaderboardElement = document.getElementById('leaderboard');

// Define the user data
let userData = {
  coins: 100,
  spins: 0,
  leaderboard: [],
  username: '',
  referrals: 0,
};

// Define the Telegram bot token
const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';

// Define the Telegram chat ID
const telegramChatId = 'YOUR_TELEGRAM_CHAT_ID';

// Define the Google Sheets API key
const googleSheetsApiKey = 'YOUR_GOOGLE_SHEETS_API_KEY';

// Define the Firebase API key
const firebaseApiKey = 'YOUR_FIREBASE_API_KEY';

// Function to draw the wheel
function drawWheel() {
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  ctx.beginPath();
  ctx.arc(wheelCanvas.width / 2, wheelCanvas.height / 2, wheelCanvas.width / 2, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Draw the segments
  for (let i = 0; i < segments.length; i++) {
    ctx.fillStyle = segments[i].color;
    ctx.beginPath();
    ctx.moveTo(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.arc(wheelCanvas.width / 2, wheelCanvas.height / 2, wheelCanvas.width / 2, (i * Math.PI) / 180, ((i + 1) * Math.PI) / 180);
    ctx.fill();
  }
}

// Function to spin the wheel
function spinWheel() {
  // Generate a random segment
  const randomSegment = Math.floor(Math.random() * segments.length);

  // Update the user data
  userData.spins++;
  userData.coins -= 10;

  // Update the result element
  resultElement.textContent = `You spun ${segments[randomSegment].name}!`;

  // Update the coins element
  coinsElement.textContent = `Coins: ${userData.coins}`;

  // Update the leaderboard element
  leaderboardElement.textContent = `Leaderboard: ${userData.leaderboard.join(', ')}`;

  // Send a message to Telegram
  const telegramMessage = `User spun ${segments[randomSegment].name}!`;
  sendTelegramMessage(telegramMessage);

  // Log to Google Sheets
  logToGoogleSheets(userData);

  // Draw the wheel
  drawWheel();
}

// Function to send a message to Telegram
function sendTelegramMessage(message) {
  const telegramUrl = `https:                                                                                                 
  fetch(telegramUrl);
}

                                   
function logToGoogleSheets(data) {
  const googleSheetsUrl = `//api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${message}`;
  fetch(telegramUrl);
}

// Function to log to Google Sheets
function logToGoogleSheets(data) {
  const googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/A1:append?valueInputOption=USER_ENTERED&key=${googleSheetsApiKey}`;
  fetch(googleSheetsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// Function to handle referrals
function handleReferral(referralCode) {
  // Update the user data
  userData.referrals++;

  // Update the coins element
  coinsElement.textContent = `Coins: ${userData.coins + 10}`;

  // Send a message to Telegram
  const telegramMessage = `User referred a friend!`;
  sendTelegramMessage(telegramMessage);
}

// Function to handle username save
function handleUsernameSave(username) {
  // Update the user data
  user
