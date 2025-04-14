//selecting required elements
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const game = document.querySelector('.game');

const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');
const scoreSound = document.getElementById('scoreSound');


//jump physics related variables
let isJumping = false;
let velocity = 0;
let gravity = 0.7;
let initialVelocity = 12;
let groundLevel = 50;
let positionFromGround = 0;
let animationFrameRequests = [];

//stats
let score = 0;
let highScore = 0;
let scoreInterval;
let scoreRate = 200; // milliseconds
let level = 1;
let nextLevelScore = 100;

//obstacle related variables
let obstacleInterval;
let obstacleSpawnRate = 2000; // milliseconds
let obstacleTimers = [];


//creating jump physics
function updatePlayerPosition() {
  velocity -= gravity;
  positionFromGround += velocity;

  if (positionFromGround < 0) {
    positionFromGround = 0;
    velocity = 0;
    isJumping = false;
  }

  player.style.bottom = `${groundLevel + positionFromGround}px`;
}

function jump() {
  if (!isJumping) {
    velocity = initialVelocity;
    jumpSound.currentTime = 0;
    jumpSound.play();
    isJumping = true;
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    jump();
  }
});

//updating score
function updateScore() {
  score++;
  scoreElement.textContent = score;
  if (score > highScore) {
    highScore = score;
    highscoreElement.textContent = highScore;
  }
  updateLevel();
}

function updateLevel() {
  if (score >= nextLevelScore) {
    level++;
    levelElement.textContent = level;

    game.classList.remove('level_1', 'level_2', 'level_3');
    if (level === 2) game.classList.add('level_2');
    else if (level >= 3) game.classList.add('level_3');

    nextLevelScore += 100;

    clearInterval(obstacleInterval);
    obstacleSpawnRate = Math.max(800, obstacleSpawnRate - 400);
    obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
  }
}

function createObstacle() {
  const obstacle = document.createElement('div');
  obstacle.classList.add('obstacle');
  // obstacle.style.right = '-30px';
  obstacle.style.animationDuration = `${obstacleSpawnRate}ms`;

  game.appendChild(obstacle);

  //check for collision
  const obstacleTimer = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();

    // console.log(playerRect);
    // console.log(obsRect);

    if (
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.bottom > obsRect.top &&
      playerRect.top < obsRect.bottom
    ) {
      hitSound.currentTime = 0;
      hitSound.play();
      gameOver();
    }


    if (obsRect.left < -30) {
      clearInterval(obstacleTimer);
      obstacle.remove();
    }
  }, 50);

  obstacleTimers.push(obstacleTimer);
}

function gameOver() {
  alert(`Game Over! Your Score is ${score}.`);
  score = 0;
  level = 1;
  nextLevelScore = 100;
  velocity = 0;
  positionFromGround = 0;
  updatePlayerPosition();
  isJumping = false;
  obstacleSpawnRate = 2000;

  scoreElement.textContent = score;
  levelElement.textContent = level;

  game.classList.remove('level_1', 'level_2', 'level_3');
  game.classList.add('level_1');

  document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

  clearInterval(obstacleInterval);
  clearInterval(scoreInterval);
  // Clear all active obstacle timers
  obstacleTimers.forEach(timer => clearInterval(timer));
  obstacleTimers = []; 


  // Show overlay again
  const startOverlay = document.getElementById('startMessage');
  startOverlay.style.display = 'flex';

  //cancel animation frame requests
  for(request of animationFrameRequests){
    cancelAnimationFrame(request);
  }
  animationFrameRequests = [];

  // Wait for ENTER again
  document.addEventListener('keydown', function restartHandler(event) {
    if (event.code === 'Enter') {
      document.removeEventListener('keydown', restartHandler);
      startOverlay.style.display = 'none';
      startGame();
      jumpLoop();
    }
  });
}


function jumpLoop() {
  console.log("game loop called!");
  updatePlayerPosition();
  let request = requestAnimationFrame(jumpLoop);
  animationFrameRequests.push(request);
}

function startGame() {
  game.classList.add('level_1');
  obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
  scoreInterval = setInterval(updateScore, scoreRate);
}

document.addEventListener('keydown', function startHandler(event) {
  if (event.code === 'Enter') {
    document.removeEventListener('keydown', startHandler);
    document.getElementById('startMessage').style.display = 'none';
    startGame();
    jumpLoop();
  }
});
