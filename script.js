const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');
const centerX = wheelCanvas.width / 2;
const centerY = wheelCanvas.height / 2;

const segments = [
  { name: 'Segment 1', color: '#FF0000', reward: 10, icon: null }, // icon: 'path/to/icon1.png'
  { name: 'Segment 2', color: '#00FF00', reward: 20, icon: null },
  { name: 'Segment 3', color: '#0000FF', reward: 30, icon: null },
  { name: 'Segment 4', color: '#FFFF00', reward: 40, icon: null },
  { name: 'Segment 5', color: '#FF00FF', reward: 50, icon: null },
];
const numSegments = segments.length;
const spinCost = 10;
const dailySpinLimit = 5;

let rotation = 0;
let spinning = false;
const spinDuration = 3000;
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

let isMuted = false;
const spinSound = new Audio(''); // Replace with your sound file path
const winSound = new Audio('');   // Replace with your sound file path
let isDarkMode = localStorage.getItem('darkMode') === 'true' || false;

let userData = {
  coins: parseInt(localStorage.getItem('userCoins')) || 100,
  username: localStorage.getItem('username') || '',
  referrals: parseInt(localStorage.getItem('referrals')) || 0,
  referredBy: localStorage.getItem('referredBy') || null,
  leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
};

function saveUserData() {
  localStorage.setItem('userCoins', userData.coins);
  localStorage.setItem('username', userData.username);
  localStorage.setItem('referrals', userData.referrals);
  localStorage.setItem('referredBy', userData.referredBy);
  localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard));
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

  // Draw the pointer
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - centerX - 10);
  ctx.lineTo(centerX - 10, centerY - centerX - 20);
  ctx.lineTo(centerX + 10, centerY - centerX - 20);
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

  const randomSpinAngle = Math.PI * 2 * 5 + Math.random() * Math.PI * 2;
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

    const ease = (t) => t * t * (3 - 2 * t);
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
    localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard.slice(0, 5))); // Keep top 5
  }
  const leaderboardHTML = userData.leaderboard.slice(0, 5).map(entry => `<div>${entry.username || 'Anonymous'}: ${entry.coins}</div>`).join('');
  leaderboardElement.innerHTML = leaderboardHTML || 'No entries yet.';
}

function handleUsernameSave() {
  const username = usernameInput.value.trim();
  if (username) {
    userData.username = username;
    localStorage.setItem('username', username);
    updateLeaderboard();
    alert(`Username saved: ${userData.username}`);
  } else {
    alert('Please enter a username.');
  }
}

function handleReferral() {
  const referralCode = referralCodeInput.value.trim();
  if (referralCode && userData.referredBy !== referralCode) {
    // In a real app, verify the code. For now, just award coins.
    userData.coins += 25; // Example referral reward
    userData.referredBy = referralCode;
    saveUserData();
    updateCoinsDisplay();
    alert('Referral code applied! You received 25 coins.');
  } else if (userData.referredBy === referralCode) {
    alert('You have already used this referral code.');
  } else if (referralCode) {
    alert('Invalid referral code.');
  }
}

function toggleSound() {
  isMuted = !isMuted;
  soundButton.textContent = isMuted ? 'Unmute' : 'Mute';
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
}

function showConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

function claimReward() {
  alert(`You have ${userData.coins} coins. Reward claim functionality needs to be implemented.`);
  // Implement your reward claim logic here
}

function loadDarkModePreference() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
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
checkDailySpinReset();
updateCoinsDisplay();
updateLeaderboard();
drawWheel();
