// Firebase & Telegram Setup const firebaseConfig = { apiKey: "AIzaSyA3HU3lmPGgngWTpb7iXqWYB4ghOb9ld_c", authDomain: "winspin-3a010.firebaseapp.com", projectId: "winspin-3a010", storageBucket: "winspin-3a010.firebasestorage.app", messagingSenderId: "1029992403673", appId: "1:1029992403673:web:a38cbddfcb8394aa1d24c8", measurementId: "G-7D7B6CRTYQ" }; const app = firebase.initializeApp(firebaseConfig); const db = firebase.firestore();

const TELEGRAM_BOT_TOKEN = "7660325670:AAGjyxqcfafCpx-BiYNIRlPG4u5gd7NDxsI"; const TELEGRAM_CHAT_ID = "5054074724";

// Elements const spinBtn = document.getElementById("spin"); const wheel = document.getElementById("wheel"); const resultText = document.getElementById("result"); const usernameInput = document.getElementById("username"); const darkToggle = document.getElementById("darkToggle"); const muteToggle = document.getElementById("muteToggle");

// User Data let username = localStorage.getItem("username") || "Guest"; let coins = parseInt(localStorage.getItem("coins") || 100); let spinsLeft = parseInt(localStorage.getItem("spins") || 3); let isMuted = localStorage.getItem("muted") === "true";

// Rewards const rewards = [ { label: "10 Coins", value: 10 }, { label: "20 Coins", value: 20 }, { label: "50 Coins", value: 50 }, { label: "Try Again", value: 0 }, { label: "Lose 10", value: -10 }, ];

function playSound(id) { if (!isMuted) document.getElementById(id).play(); }

function showConfetti() { // You can integrate confetti.js or custom SVG animation }

function updateUI() { document.getElementById("coins").innerText = Coins: ${coins}; document.getElementById("spins").innerText = Spins Left: ${spinsLeft}; }

function saveState() { localStorage.setItem("username", username); localStorage.setItem("coins", coins); localStorage.setItem("spins", spinsLeft); }

function sendTelegramAlert(text) { fetch(https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }) }); }

function logToFirebase(data) { db.collection("spinLogs").add(data); }

spinBtn.addEventListener("click", () => { if (spinsLeft <= 0) return alert("No spins left today!");

const angle = Math.floor(Math.random() * 360); const index = Math.floor(angle / (360 / rewards.length)); const reward = rewards[index];

wheel.style.transform = rotate(${angle + 720}deg); playSound("spinSound");

setTimeout(() => { coins += reward.value; spinsLeft--; updateUI(); saveState(); resultText.innerText = You got: ${reward.label}; if (reward.value > 0) showConfetti(); playSound("winSound");

const log = {
  username,
  reward: reward.label,
  coins,
  time: new Date().toISOString(),
};
logToFirebase(log);
sendTelegramAlert(`${username} won ${reward.label} | Coins: ${coins}`);

}, 3000); });

// Settings Toggles darkToggle.addEventListener("click", () => { document.body.classList.toggle("dark"); });

muteToggle.addEventListener("click", () => { isMuted = !isMuted; localStorage.setItem("muted", isMuted); });

usernameInput.addEventListener("change", (e) => { username = e.target.value; saveState(); });

// Init usernameInput.value = username; updateUI();

