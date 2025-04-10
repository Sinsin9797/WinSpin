let coins = 100;
document.getElementById('spin-btn').addEventListener('click', function () {
    let outcome = Math.floor(Math.random() * 6) + 1; // Random number (1-6)
    let rewards = [10, 20, 50, 100, 5, 0]; // Possible rewards

    coins += rewards[outcome - 1]; // Add reward to coins
    document.getElementById('coins').textContent = coins;

    document.getElementById('win-message').textContent = `You won ${rewards[outcome - 1]} coins!`;
});

// Dark Mode Toggle
document.getElementById('dark-mode-btn').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});

// Sound Effects Toggle (Example)
document.getElementById('mute-btn').addEventListener('click', function () {
    alert("Sound muted/unmuted! (Replace with actual audio logic)");
});
