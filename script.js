// Spin & Win Logic
const rewards = [
    { name: "10 Coins", value: 10, color: "#ff6b6b", icon: "🪙" },
    { name: "20 Coins", value: 20, color: "#4ecdc4", icon: "💰" },
    { name: "Lose 5 Coins", value: -5, color: "#45b7d1", icon: "❌" },
    { name: "50 Coins", value: 50, color: "#96c93d", icon: "🎁" }
];
const segments = rewards.length;
const sliceDeg = 360 / segments;
let coins = 100; // Starting coins
let spinsToday = 0;
const maxSpinsPerDay = 3;
let isSpinning = false;

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");
const coinsDiv = document.getElementById("coins");
const toggleDark = document.getElementById("toggleDark");

// Build the wheel
function createWheel() {
    wheel.innerHTML = "";
    for (let i = 0; i < segments; i++) {
        const deg = i * sliceDeg;
        const segment = document.createElement("div");
        segment.className = "segment";
        segment.style.backgroundColor = rewards[i].color;
        segment.style.transform = `rotate(${deg}deg)`;
        const icon = document.createElement("span");
        icon.innerText = rewards[i].icon;
        icon.style.position = "absolute";
        icon.style.left = "70%";
        icon.style.top = "20%";
        icon.style.fontSize = "24px";
        segment.appendChild(icon);
        wheel.appendChild(segment);
    }
}

// Spin logic
function spinWheel() {
    if (isSpinning || spinsToday >= maxSpinsPerDay) {
        resultDiv.innerText = spinsToday >= maxSpinsPerDay ? "Spin limit reached for today!" : "Please wait!";
        return;
    }
    isSpinning = true;
    spinBtn.disabled = true;
    spinsToday++;

    const randomDeg = Math.floor(Math.random() * 360) + 720; // Spin 2+ full rotations
    wheel.style.transform = `rotate(${randomDeg}deg)`;

    setTimeout(() => {
        const finalDeg = randomDeg % 360;
        const winningSegment = Math.floor((360 - finalDeg) / sliceDeg) % segments;
        const reward = rewards[winningSegment];
        coins += reward.value;
        coins = Math.max(0, coins); // No negative coins
        resultDiv.innerText = `You won: ${reward.name}!`;
        coinsDiv.innerText = `Coins: ${coins}`;

        // Confetti effect
        if (reward.value > 0) {
            $(document).confetti({
                duration: 2000,
                elementCount: 100
            });
        }

        // Sound effect (browser-based, no external file)
        const audio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
        audio.play();

        isSpinning = false;
        spinBtn.disabled = false;
    }, 4000); // Match CSS transition duration
}

// Dark mode toggle
toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Event listeners
spinBtn.addEventListener("click", spinWheel);

// Initialize
createWheel();
coinsDiv.innerText = `Coins: ${coins}`;
