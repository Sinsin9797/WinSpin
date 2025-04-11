// Full Spin Wheel Game with 20 features (JS File) // Firebase + Telegram + LocalStorage + Game Logic + UI Toggles

// 1. Firebase Setup import { initializeApp } from "firebase/app"; import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = { apiKey: "AIzaSyA3HU3lmPGgngWTpb7iXqWYB4ghOb9ld_c", authDomain: "winspin-3a010.firebaseapp.com", projectId: "winspin-3a010", storageBucket: "winspin-3a010.appspot.com", messagingSenderId: "1029992403673", appId: "1:1029992403673:web:a38cbddfcb8394aa1d24c8", measurementId: "G-7D7B6CRTYQ" }; const app = initializeApp(firebaseConfig); const db = getFirestore(app);

// 2. Username Input let username = localStorage.getItem("username") || prompt("Enter your username:"); localStorage.setItem("username", username);

// 3. Referral Tracking const urlParams = new URLSearchParams(window.location.search); const ref = urlParams.get("ref"); if (ref) localStorage.setItem("referredBy", ref);

// 4. Create User async function createUserIfNotExists() { const userRef = doc(db, "users", username); const userSnap = await getDoc(userRef);

if (!userSnap.exists()) { await setDoc(userRef, { coins: 50, stars: 10, referralCount: 0, referredBy: localStorage.getItem("referredBy") || null, spinsToday: 0 }); if (ref) { const refUserRef = doc(db, "users", ref); await updateDoc(refUserRef, { coins: increment(20), referralCount: increment(1) }); } } } createUserIfNotExists();

// 5. Spin Limit System async function canSpinToday() { const userRef = doc(db, "users", username); const userSnap = await getDoc(userRef); const data = userSnap.data(); return data.spinsToday < 5; }

async function incrementSpinCount() { const userRef = doc(db, "users", username); await updateDoc(userRef, { spinsToday: increment(1) }); }

// 6. Deduct Stars for Spin async function deductStarsForSpin() { const userRef = doc(db, "users", username); const userSnap = await getDoc(userRef); const data = userSnap.data(); if (data.stars >= 5) { await updateDoc(userRef, { stars: increment(-5) }); return true; } else { alert("Not enough stars"); return false; } }

// 7. Spin & Win Logic (Example Only) function spinWheel() { const rewards = ["10", "20", "30", "50", "Better Luck", "100"]; const result = rewards[Math.floor(Math.random() * rewards.length)]; showResult(result); }

// 8. Show Result function showResult(result) { if (!isNaN(result)) { updateUserCoins(parseInt(result)); sendTelegramWin(result); } alert(You won: ${result}); }

// 9. Update Firebase Coins async function updateUserCoins(amount) { const userRef = doc(db, "users", username); await updateDoc(userRef, { coins: increment(amount) }); }

// 10. Telegram Win Alert function sendTelegramWin(coins) { fetch("https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: "<YOUR_CHAT_ID>", text: User ${username} won ${coins} coins on Spin Wheel! }) }); }

// 11. Withdraw Request async function requestWithdraw() { const userRef = doc(db, "users", username); const userSnap = await getDoc(userRef); const data = userSnap.data(); if (data.coins >= 50) { fetch("https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: "<YOUR_CHAT_ID>", text: Withdraw request: ${username}, Coins: ${data.coins} }) }); alert("Withdraw requested!"); } else { alert("Minimum 50 coins required to withdraw."); } }

// 12. Confetti (Use library) // confetti.start(); confetti.stop(); etc.

// 13. Custom Icons (handled in HTML/CSS per segment)

// 14. Dark Mode Toggle function toggleDarkMode() { document.body.classList.toggle("dark-mode"); }

// 15. Mute/Unmute let muted = false; function toggleMute() { muted = !muted; }

// 16. Google Sheets Logging (Webhook example) function logToGoogleSheet(win) { fetch("<YOUR_GOOGLE_SCRIPT_WEBHOOK>", { method: "POST", body: JSON.stringify({ username, win }), headers: { "Content-Type": "application/json" } }); }

// 17. Referral Link Show function showReferralLink() { alert(Your link: ?ref=${username}); }

// 18. Telegram Command (/stars, /withdraw etc) handled in Telegram Bot code

// 19. Coins & Stars Display async function displayBalance() { const userRef = doc(db, "users", username); const userSnap = await getDoc(userRef); const data = userSnap.data(); document.getElementById("coins").innerText = data.coins; document.getElementById("stars").innerText = data.stars; }

// 20. Leaderboard - You can create a Firebase function or sort client-side

// Finally, call displayBalance every time setInterval(displayBalance, 3000);

