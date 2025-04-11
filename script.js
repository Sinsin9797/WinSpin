const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const button = document.getElementById('spin-button');
const resultElement = document.getElementById('result');
const radius = canvas.width / 2;
const center = radius;

const segments = [
  { name: '2', color: '#81D4FA', reward: 2 },
  { name: 'BONUS', color: '#FFB300', reward: 100 },
  { name: '6', color: '#80CBC4', reward: 6 },
  { name: 'SORRY', color: '#BA68C8', reward: 0 },
  { name: '8', color: '#CE93D8', reward: 8 },
  { name: 'SPIN AGAIN', color: '#FDD835', reward: 0 },
  { name: '4', color: '#4DB6AC', reward: 4 },
  { name: '8', color: '#E6EE9C', reward: 8 },
];
const numSegments = segments.length;
let rotation = 0;
let spinning = false;
const spinDuration = 3000; // మిల్లీసెకన్లు
let spinStartTime;
let animationFrameId;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let startAngle = rotation;
  const angle = Math.PI * 2 / numSegments;
  const textRadius = radius * 0.6;

  for (let i = 0; i < numSegments; i++) {
    const endAngle = startAngle + angle;

    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.lineTo(center, center);
    ctx.fillStyle = segments[i].color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // టెక్స్ట్ డ్రా చేయడం
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    const textX = center + textRadius * Math.cos(startAngle + angle / 2);
    const textY = center + textRadius * Math.sin(startAngle + angle / 2) + 5;
    ctx.fillText(segments[i].name, textX, textY);

    startAngle = endAngle;
  }

  // పాయింటర్ డ్రా చేయడం
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(center, center - radius - 15);
  ctx.lineTo(center - 10, center - radius - 30);
  ctx.lineTo(center + 10, center - radius - 30);
  ctx.closePath();
  ctx.fill();
}

function spin() {
  if (spinning) return;
  spinning = true;
  button.disabled = true;
  resultElement.textContent = '';

  const randomSpinAngle = Math.PI * 2 * 5 + Math.random() * Math.PI * 2;
  const animationDuration = spinDuration;
  spinStartTime = Date.now();

  function animate() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - spinStartTime;

    if (elapsedTime >= animationDuration) {
      spinning = false;
      button.disabled = false;
      rotation = randomSpinAngle;
      drawWheel();
      const winningSegmentIndex = Math.floor((numSegments - (rotation / (Math.PI * 2)) * numSegments) % numSegments);
      resultElement.textContent = `మీరు ${segments[winningSegmentIndex].name} పై ల్యాండ్ అయ్యారు!`;
      return;
    }

    const ease = (t) => t * t * (3 - 2 * t); // ఈజ్-ఇన్-అవుట్ ఫంక్షన్
    const timeFraction = ease(elapsedTime / animationDuration);
    rotation = randomSpinAngle * timeFraction;
    drawWheel();
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

button.addEventListener('click', spin);

// మొదటిసారి డ్రా చేయడం
drawWheel();
