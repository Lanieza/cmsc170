const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player, light, goal, detected, gameOver, gameWon, stage;
let obstacles = [];
const speed = 5;
let lightSpeed = 1.5;
let keys = {};

function resetGame() {
  stage = 1;
  startStage();
}

function startStage() {
  player = { x: 50, y: 50, radius: 16 };
  light = { x: 300, y: 200, size: 100 };
  goal = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    radius: 20,
  };
  detected = false;
  gameOver = false;
  gameWon = false;
  obstacles = generateObstacles(stage);
  lightSpeed = 1.5 + stage * 0.5;
}

function generateObstacles(stage) {
  let obs = [];
  for (let i = 0; i < stage; i++) {
    obs.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 60) + 30,
      width: 80,
      height: 15,
      speed: (Math.random() + 0.5) * 2,
      direction: Math.random() < 0.5 ? 1 : -1,
    });
  }
  return obs;
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "r" || e.key === "R") resetGame(); // Restart game
});

document.addEventListener("keyup", (e) => (keys[e.key] = false));

function movePlayer() {
  if (gameOver || gameWon) return;
  if (keys["ArrowUp"] && player.y - player.radius > 0) player.y -= speed;
  if (keys["ArrowDown"] && player.y + player.radius < canvas.height)
    player.y += speed;
  if (keys["ArrowLeft"] && player.x - player.radius > 0) player.x -= speed;
  if (keys["ArrowRight"] && player.x + player.radius < canvas.width)
    player.x += speed;
}

function moveLight() {
  if (gameOver || gameWon) return;

  let dx = player.x - light.x;
  let dy = player.y - light.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // Light follows the player
  if (distance > 5) {
    light.x += (dx / distance) * lightSpeed;
    light.y += (dy / distance) * lightSpeed;
  }

  detected = distance < light.size * 0.5;

  if (detected) {
    gameOver = true; // End game when caught
  }
}

function moveObstacles() {
  for (let obs of obstacles) {
    obs.x += obs.speed * obs.direction;

    if (obs.x < 0 || obs.x + obs.width > canvas.width) {
      obs.direction *= -1;
    }
  }
}

function checkWin() {
  let dx = player.x - goal.x;
  let dy = player.y - goal.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < player.radius + goal.radius) {
    if (stage < 5) {
      stage++;
      startStage();
    } else {
      gameWon = true;
    }
  }
}

function checkObstacleCollision() {
  for (let obs of obstacles) {
    if (
      player.x + player.radius > obs.x &&
      player.x - player.radius < obs.x + obs.width &&
      player.y + player.radius > obs.y &&
      player.y - player.radius < obs.y + obs.height
    ) {
      gameOver = true;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw dark background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw light effect on background
  let backgroundGradient = ctx.createRadialGradient(
    light.x,
    light.y,
    20,
    light.x,
    light.y,
    light.size
  );
  backgroundGradient.addColorStop(0, "rgba(255, 255, 150, 0.5)");
  backgroundGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles (Dark Red with Glow)
  for (let obs of obstacles) {
    let playerNear =
      Math.abs(player.x - obs.x) < 50 && Math.abs(player.y - obs.y) < 50;

    ctx.fillStyle = playerNear
      ? "rgba(255, 0, 0, 0.8)"
      : "rgba(139, 0, 0, 0.8)";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Add outline
    ctx.strokeStyle = "rgba(255, 50, 50, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Draw end goal
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw player as a circle
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw light effect
  let lightGradient = ctx.createRadialGradient(
    light.x,
    light.y,
    10,
    light.x,
    light.y,
    light.size
  );
  lightGradient.addColorStop(0, "rgba(255, 255, 200, 0.8)");
  lightGradient.addColorStop(1, "rgba(255, 255, 0, 0)");
  ctx.fillStyle = lightGradient;
  ctx.beginPath();
  ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
  ctx.fill();

  // Show stage number
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Stage: ${stage}`, 50, 30);

  // Show game over message
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    ctx.fillText(
      "Press 'R' to Restart",
      canvas.width / 2,
      canvas.height / 2 + 40
    );
  }

  // Show win message
  if (gameWon) {
    ctx.fillStyle = "green";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
    ctx.fillText(
      "Press 'R' to Restart",
      canvas.width / 2,
      canvas.height / 2 + 40
    );
  }
}

function gameLoop() {
  movePlayer();
  moveLight();
  moveObstacles();
  checkWin();
  checkObstacleCollision();
  draw();
  requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
