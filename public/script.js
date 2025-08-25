const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let playerId = null;
let gameState = null;
let ws = new WebSocket("ws://" + window.location.hostname + ":8080");

let moveUp = false;
let moveDown = false;
let paddleY = 200;

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === "welcome") playerId = data.playerId;
  if (data.type === "state") gameState = data.gameState;
};

function sendMove() {
  if (playerId !== null) {
    ws.send(JSON.stringify({ type: "move", y: paddleY }));
  }
}

function loop() {
  if (!gameState) return requestAnimationFrame(loop);

  if (playerId !== null) {
    if (moveUp) paddleY -= 5;
    if (moveDown) paddleY += 5;
    if (paddleY < 0) paddleY = 0;
    if (paddleY > 320) paddleY = 320;
    sendMove();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // balle
  ctx.fillStyle = "white";
  ctx.fillRect(gameState.ball.x, gameState.ball.y, 10, 10);

  // paddles
  ctx.fillRect(10, gameState.paddles[0], 10, 80);
  ctx.fillRect(580, gameState.paddles[1], 10, 80);

  requestAnimationFrame(loop);
}
loop();

// clavier
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") moveUp = true;
  if (e.key === "ArrowDown") moveDown = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") moveUp = false;
  if (e.key === "ArrowDown") moveDown = false;
});

// mobile
document.getElementById("up").addEventListener("touchstart", () => moveUp = true);
document.getElementById("up").addEventListener("touchend", () => moveUp = false);

document.getElementById("down").addEventListener("touchstart", () => moveDown = true);
document.getElementById("down").addEventListener("touchend", () => moveDown = false);
