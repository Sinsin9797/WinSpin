const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');
const centerX = wheelCanvas.width / 2;
const centerY = wheelCanvas.height / 2;

const segments = [
  { name: '2', color: '#81D4FA', reward: 2, icon: null },
  { name: 'BONUS', color: '#FFB300', reward: 100, icon: null },
  { name: '6', color: '#80CBC4', reward: 6, icon: null },
  { name: 'SORRY', color: '#BA68C8', reward: 0, icon: null },
  { name: '8', color: '#CE93D8', reward: 8, icon: null },
  { name: 'SPIN AGAIN', color: '#FDD835', reward: 0, icon: null },
  { name: '4', color: '#4DB6AC', reward: 4, icon: null },
  { name: '8', color: '#E6EE9C', reward: 8, icon: null },
];
const numSegments = segments.length;
const spinCost = 10;
const dailySpinLimit = 5;

let rotation = 0;
let spinning = false;
const spinDuration = 5000;
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
const dailyCheckinButton = document.getElementById('daily-checkin-button');

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

let lastCheckinDate = localStorage.getItem('lastCheckinDate') || null;
const checkinReward = 50;

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
  ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI); // మధ్యలో ఒక చిన్న ఆకుపచ్చ రంగు వృత్తాన్ని డ్రా చేస్తుంది
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
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
  animateCoins(userData.coins, userData.coins + currentReward);
  userData.coins += currentReward;
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
  animateCoins(userData.coins, userData.coins - spinCost);
  userData.coins -= spinCost;
  spinsToday++;
  localStorage.setItem('spinsToday', spinsToday);
  updateLeaderboard();
  saveUserData();
  updateSpinButtonState();

  const randomSpinAngle = Math.PI * 2 * 8 + Math.random() * Math.PI * 2;
  const animationDuration = spinDuration;
  spinStartTime = Date.now();

  function animateSpin() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - spinStartTime;

    if (elapsedTime >= animationDuration) {
      rotation = randomSpinAngle;
      spinning = false;
      onSpinEnd();
      // drawWheel(); // దీన్ని ఇక్కడ కాల్ చేయకూడదు
      return;
    }

    const ease = (t) => t * t * (3 - 2 * t);
    const timeFraction = ease(elapsedTime / animationDuration);
    rotation = randomSpinAngle * timeFraction;

    // drawWheel(); // దీన్ని ఇక్కడ కాల్ చేయకూడదు
    requestAnimationFrame(animateSpin);
  }

  resultElement.textContent = 'Spinning...';
  if (!isMuted && spinSound.src) {
    spinSound.play();
  }
  animateSpin();
}

function animateCoins(startValue, endValue) {
  let currentValue = startValue;
  const duration = 1000;
  const startTime = Date.now();

  function update() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    currentValue = Math.floor(startValue + (endValue - startValue) * progress);
    coinsElement.textContent = `Coins: ${currentValue}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}

function updateCoinsDisplay() {
  // animateCoins ఫంక్షన్‌లోనే కాయిన్స్ డిస్‌ప్లే అప్‌డేట్ అవుతుంది
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
    animateCoins(userData.coins - 25, userData.coins);
    updateLeaderboard();
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
    particleCount: 200,
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

function checkDailyCheckin() {
  const today = new Date().toDateString();
  if (lastCheckinDate !== today) {
    dailyCheckinButton.disabled = false;
    dailyCheckinButton.textContent = 'Daily Checkin';
  } else {
    dailyCheckinButton.disabled = true;
    dailyCheckinButton.textContent = 'Checked In Today';
  }
}

function handleDailyCheckin() {
  const today = new Date().toDateString();
  if (lastCheckinDate !== today) {
    userData.coins += checkinReward;
    animateCoins(userData.coins - checkinReward, userData.coins);
    saveUserData();
    lastCheckinDate = today;
    localStorage.setItem('lastCheckinDate', lastCheckinDate);
    checkDailyCheckin();
    alert(`You claimed your daily check-in reward of ${checkinReward} coins!`);
  }
}

// Event listeners
spinButton.addEventListener('click', spinWheel);
saveUsernameButton.addEventListener('click', handleUsernameSave);
submitReferralButton.addEventListener('click', handleReferral);
soundButton.addEventListener('click', toggleSound);
darkModeButton.addEventListener('click', toggleDarkMode);
claimRewardButton.addEventListener('click', claimReward);
dailyCheckinButton.addEventListener('click', handleDailyCheckin);
window.onload = () => {
  loadDarkModePreference();
  loadSoundPreference();
  checkDailySpinReset();
  checkDailyCheckin();
  animateCoins(0, userData.coins);
  updateLeaderboard();

  const wheelCanvas = document.getElementById('wheel');
  const ctx = wheelCanvas.getContext('2d');

  // ఇక్కడ కాన్వాస్ డైమెన్షన్స్‌ను సెట్ చేస్తున్నాము
  wheelCanvas.width = 400;
  wheelCanvas.height = 400;

  console.log("Canvas Width:", wheelCanvas.width); // కాన్వాస్ వెడల్పును తనిఖీ చేయడానికి
  console.log("Canvas Height:", wheelCanvas.height); // కాన్వాస్ ఎత్తును తనిఖీ చేయడానికి

  drawWheel(); // సింపుల్ డ్రా ఫంక్షన్‌ను కాల్ చేస్తున్నాము

  if (userData.username) {
    referralCodeDisplay.textContent = `Your Referral Code: ${userData.referral}`;
  }
};
