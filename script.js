const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');
const centerX = wheelCanvas.width / 2;
const centerY = wheelCanvas.height / 2;

const segments = [
  { name: 'Segment 1', color: '#e74c3c', reward: 10, icon: null }, // ఎరుపు
  { name: 'Segment 2', color: '#27ae60', reward: 20, icon: null }, // ఆకుపచ్చ
  { name: 'Segment 3', color: '#3498db', reward: 30, icon: null }, // నీలం
  { name: 'Segment 4', color: '#f39c12', reward: 40, icon: null }, // నారింజ
  { name: 'Segment 5', color: '#9b59b6', reward: 50, icon: null }, // ఊదా
];
const numSegments = segments.length;
const spinCost = 10;
const dailySpinLimit = 5;

let rotation = 0;
let spinning = false;
const spinDuration = 5000; // మరింత మెరుగైన యానిమేషన్ కోసం వ్యవధిని పెంచండి
let spinStartTime;
let currentReward = 0;
let spinsToday = parseInt(localStorage.getItem('spinsToday')) || 0;
let lastSpinDate = localStorage.getItem('lastSpinDate') || null;

const spinButton = document.getElementById('spin-button');
const resultElement = document.getElementById('result');
const coinsElement = document.getElementById('coins');
const leaderboardElement = document.getElementById('leaderboard');
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-button');
const referralCodeInput = document.getElementById('referral-code-input');
const submitReferralButton = document.getElementById('submit-referral-button');
const soundButton = document.getElementById('sound-button');
const darkModeButton = document.getElementById('dark-mode-toggle');
const confettiContainer = document.getElementById('confetti-container');
const claimRewardButton = document.getElementById('claim-reward-button');
const referralCodeDisplay = document.getElementById('referral-code');

let isMuted = localStorage.getItem('isMuted') === 'true' || false;
const spinSound = new Audio('spin.mp3');
const winSound = new Audio('win.mp3');
let isDarkMode = localStorage.getItem('darkMode') === 'true' || false;

let userData = {
  coins: parseInt(localStorage.getItem('userCoins')) || 100,
  username: localStorage.getItem('username') || '',
  referral: localStorage.getItem('referral') || generateReferralCode(),
  referredBy: localStorage.getItem('referredBy') || null,
  leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
};

function generateReferralCode() {
  const usernamePart = userData.username ? userData.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'guest';
  const randomNumber = Math.random().toString(36).substring(2, 5);
  return `${usernamePart}@${randomNumber}`;
}

function saveUserData() {
  localStorage.setItem('userCoins', userData.coins);
  localStorage.setItem('username', userData.username);
  localStorage.setItem('referral', userData.referral);
  localStorage.setItem('referredBy', userData.referredBy);
  localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard));
  localStorage.setItem('isMuted', isMuted);
}

function checkDailySpinReset() {
  const today = new Date().toDateString();
  if (lastSpinDate !== today) {
    spinsToday = 0;
    lastSpinDate = today;
    localStorage.setItem('spinsToday', spinsToday);
    localStorage.setItem('lastSpinDate', lastSpinDate);
  }
  updateSpinButtonState();
}

function updateSpinButtonState() {
  if (userData.coins < spinCost || spinsToday >= dailySpinLimit) {
    spinButton.disabled = true;
    spinButton.textContent = userData.coins < spinCost ? `Not enough coins` : `Daily limit reached`;
  } else {
    spinButton.disabled = false;
    spinButton.textContent = `Spin (${spinCost} Coins)`;
  }
}

function drawWheel() {
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerX, 0, 2 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  const angle = Math.PI * 2 / numSegments;
  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * angle;
    const endAngle = (i + 1) * angle;

    ctx.fillStyle = segments[i].color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, centerX, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // టెక్స్ట్ మరియు ఐకాన్‌లను మరింత స్పష్టంగా గీయడం
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    const textRadius = centerX * 0.6;
    const textX = centerX + textRadius * Math.cos(startAngle + angle / 2);
    const textY = centerY + textRadius * Math.sin(startAngle + angle / 2) + 5; // కొంచెం కిందకు

    // టెక్స్ట్ రొటేట్ చేసి గీయడం
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(startAngle + angle / 2 + Math.PI / 2); // టెక్స్ట్ నిలువుగా ఉండేలా
    ctx.fillText(segments[i].name, 0, 0);
    ctx.restore();

    if (segments[i].icon) {
      const img = new Image();
      img.onload = () => {
        const iconSize = 30;
        const iconRadius = centerX * 0.7;
        const iconAngle = startAngle + angle / 2;
        const iconX = centerX + iconRadius * Math.cos(iconAngle) - iconSize / 2;
        const iconY = centerY + iconRadius * Math.sin(iconAngle) - iconSize / 2;
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      };
      img.src = segments[i].icon;
    }
  }

  // పాయింటర్‌ను మరింత స్పష్టంగా గీయడం
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - centerX - 15);
  ctx.lineTo(centerX - 15, centerY - centerX - 30);
  ctx.lineTo(centerX + 15, centerY - centerX - 30);
  ctx.closePath();
  ctx.fill();
}

function getWinningSegment() {
  const normalizedRotation = rotation % (2 * Math.PI);
  const segmentAngle = Math.PI * 2 / numSegments;
  const winningSegmentIndex = Math.floor((2 * Math.PI - normalizedRotation) / segmentAngle);
  return winningSegmentIndex;
}

function onSpinEnd() {
  spinning = false;
  const winningSegmentIndex = getWinningSegment();
  const winningSegment = segments[winningSegmentIndex];
  currentReward = winningSegment.reward;

  resultElement.textContent = `You landed on ${winningSegment.name} and won ${currentReward} coins!`;
  userData.coins += currentReward;
  updateCoinsDisplay();
  updateLeaderboard();
  saveUserData();
  showConfetti();
  if (!isMuted && winSound.src) {
    winSound.play();
  }
  updateSpinButtonState();
}

function spinWheel() {
  checkDailySpinReset();
  if (spinning) return;
  if (userData.coins < spinCost) {
    resultElement.textContent = 'Not enough coins to spin!';
    return;
  }
  if (spinsToday >= dailySpinLimit) {
    resultElement.textContent = `You have reached your daily spin limit of ${dailySpinLimit}.`;
    return;
  }

  spinning = true;
  userData.coins -= spinCost;
  spinsToday++;
  localStorage.setItem('spinsToday', spinsToday);
  updateCoinsDisplay();
  saveUserData();
  updateSpinButtonState();

  const randomSpinAngle = Math.PI * 2 * 8 + Math.random() * Math.PI * 2; // మరింత వేగంగా మరియు ఎక్కువ భ్రమణాల కోసం
  const animationDuration = spinDuration;
  spinStartTime = Date.now();

  function animateSpin() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - spinStartTime;

    if (elapsedTime >= animationDuration) {
      rotation = randomSpinAngle;
      spinning = false;
      onSpinEnd();
      drawWheel();
      return;
    }

    const ease = (t) => t * t * (3 - 2 * t); // క్యూబిక్ ఈజింగ్
    const timeFraction = ease(elapsedTime / animationDuration);
    rotation = randomSpinAngle * timeFraction;

    drawWheel();
    requestAnimationFrame(animateSpin);
  }

  resultElement.textContent = 'Spinning...';
  if (!isMuted && spinSound.src) {
    spinSound.play();
  }
  animateSpin();
}

function updateCoinsDisplay() {
  coinsElement.textContent = `Coins: ${userData.coins}`;
}

function updateLeaderboard() {
  if (userData.username) {
    const existingEntryIndex = userData.leaderboard.findIndex(entry => entry.username === userData.username);
    if (existingEntryIndex !== -1) {
      userData.leaderboard[existingEntryIndex].coins = userData.coins;
    } else {
      userData.leaderboard.push({ username: userData.username, coins: userData.coins });
    }
    userData.leaderboard.sort((a, b) => b.coins - a.coins);
    localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard.slice(0, 5)));
  }
  const leaderboardHTML = userData.leaderboard.slice(0, 5).map(entry => `<div>${entry.username || 'Anonymous'}: ${entry.coins}</div>`).join('');
  leaderboardElement.innerHTML = leaderboardHTML || 'No entries yet.';
}

function handleUsernameSave() {
  const username = usernameInput.value.trim();
  if (username) {
    userData.username = username;
    userData.referral = generateReferralCode();
    referralCodeDisplay.textContent = `Your Referral Code: ${userData.referral}`;
    localStorage.setItem('username', username);
    localStorage.setItem('referral', userData.referral);
    updateLeaderboard();
    alert(`Username saved: ${userData.username}`);
  } else {
    alert('Please enter a username.');
  }
}

function handleReferral() {
  const referralCode = referralCodeInput.value.trim();
  if (referralCode && userData.referral !== referralCode && userData.referredBy !== referralCode) {
    userData.coins += 25;
    userData.referredBy = referralCode;
    saveUserData();
    updateCoinsDisplay();
    alert('Referral code applied! You received 25 coins.');
  } else if (userData.referral === referralCode) {
    alert('This is your own referral code.');
  } else if (userData.referredBy === referralCode) {
    alert('You have already used this referral code.');
  } else if (referralCode) {
    alert('Invalid referral code.');
  }
}

function toggleSound() {
  isMuted = !isMuted;
  soundButton.textContent = isMuted ? 'Unmute' : 'Mute';
  localStorage.setItem('isMuted', isMuted);
  spinSound.muted = isMuted;
  winSound.muted = isMuted;
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
}

function showConfetti() {
  confetti({
    particleCount: 200, // మరింత కాన్ఫెట్టి
    spread: 100,
    origin: { y: 0.7 },
  });
}

function claimReward() {
  alert(`You have ${userData.coins} coins. Reward claim functionality needs to be implemented.`);
}

function loadDarkModePreference() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

function loadSoundPreference() {
  isMuted = localStorage.getItem('isMuted') === 'true' || false;
  soundButton.textContent = isMuted ? 'Unmute' : 'Mute';
  spinSound.muted = isMuted;
  winSound.muted = isMuted;
}

// Event listeners
spinButton.addEventListener('click', spinWheel);
saveUsernameButton.addEventListener('click', handleUsernameSave);
submitReferralButton.addEventListener('click', handleReferral);
soundButton.addEventListener('click', toggleSound);
darkModeButton.addEventListener('click', toggleDarkMode);
claimRewardButton.addEventListener('click', claimReward);

// Initial setup
loadDarkModePreference();
loadSoundPreference();
checkDailySpinReset();
updateCoinsDisplay();
updateLeaderboard();
drawWheel();
if (userData.username) {
  referralCodeDisplay.textContent = `Your Referral Code: ${userData.referral}`;
}
