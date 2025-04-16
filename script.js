const player = document.getElementById('player');
const reward = document.getElementById('reward');
const scoreDisplay = document.getElementById('score');
const gameOverText = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Initial score
let treats = 2008;
scoreDisplay.textContent = treats;

// Sound
const treatSound = new Audio('wow.mp3');
treatSound.volume = 1;

// Unlock audio on user interaction
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;

  treatSound.play().then(() => {
    treatSound.pause();
    treatSound.currentTime = 0;
    audioUnlocked = true;
  }).catch(() => {});

  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('touchstart', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

// Game variables
let px = 100, py = 100;
let dx = 35, dy = 0;
let lastTreatTime = null;

function randomPosition() {
  const area = document.getElementById('gameArea');
  const maxX = area.clientWidth - 50;
  const maxY = area.clientHeight - 50;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  reward.style.left = x + 'px';
  reward.style.top = y + 'px';
}

function updatePlayer() {
  px += dx;
  py += dy;

  const area = document.getElementById('gameArea');
  const maxX = area.clientWidth - 50;
  const maxY = area.clientHeight - 50;

  px = Math.max(0, Math.min(px, maxX));
  py = Math.max(0, Math.min(py, maxY));

  player.style.left = px + 'px';
  player.style.top = py + 'px';

  const pr = reward.getBoundingClientRect();
  const pl = player.getBoundingClientRect();

  const overlap = !(pr.right < pl.left || pr.left > pl.right || pr.bottom < pl.top || pr.top > pl.bottom);

  if (overlap) {
    treatSound.pause();              // Stop current audio
    treatSound.currentTime = 0;     // Reset to start
    treatSound.play().catch((e) => console.log("Treat sound error:", e));
    player.src = 'happy.png';
    setTimeout(() => player.src = 'sad.png', 800);

    lastTreatTime = Date.now();
    treats++;
    scoreDisplay.textContent = treats;
    randomPosition();
  }
}

// Keyboard control
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    dx = 0; dy = -30; break;
    case 'ArrowDown':  dx = 0; dy = 30; break;
    case 'ArrowLeft':  dx = -30; dy = 0; break;
    case 'ArrowRight': dx = 30; dy = 0; break;
  }
});

// Mobile swipe
let startX, startY;
document.getElementById('gameArea').addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.getElementById('gameArea').addEventListener('touchmove', (e) => {
  if (!startX || !startY) return;
  let dxTouch = e.touches[0].clientX - startX;
  let dyTouch = e.touches[0].clientY - startY;

  if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
    dx = dxTouch > 0 ? 30 : -30;
    dy = 0;
  } else {
    dy = dyTouch > 0 ? 30 : -30;
    dx = 0;
  }

  startX = null;
  startY = null;
});

function gameOver() {
  clearInterval(moveInterval);
  clearInterval(stateCheck);
  gameOverText.style.display = 'block';
  restartBtn.style.display = 'inline-block';
}

restartBtn.onclick = () => location.reload();

// Start game
player.src = 'sad.png';
randomPosition();
lastTreatTime = Date.now();

const moveInterval = setInterval(updatePlayer, 70);
const stateCheck = setInterval(() => {
  const now = Date.now();
  const sinceLast = (now - lastTreatTime) / 1000;

  if (sinceLast > 3) gameOver();
}, 500);
