let coins = 100;
let wheel = document.getElementById('wheel');

document.getElementById('spin-btn').addEventListener('click', function () {
    let rotation = Math.floor(Math.random() * 360) + 1440; // Random spin value
    wheel.style.transition = "transform 3s ease-out";
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
        let reward = [10, 20, 50, 100, 5, 0][Math.floor(Math.random() * 6)];
        coins += reward;
        document.getElementById('coins').textContent = coins;
        document.getElementById('win-message').textContent = `🎉 You won ${reward} coins! 🎉`;
    }, 3000);
});

// Dark Mode Toggle
document.getElementById('dark-mode-btn').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});

// Sound Effects Toggle
document.getElementById('mute-btn').addEventListener('click', function () {
    alert("Sound muted/unmuted! (Replace with actual audio logic)");
});
