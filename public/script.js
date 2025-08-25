const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

let ws = new WebSocket(`wss://${window.location.host}`);
let playerId = null;
let state = null;

const paddleWidth = 10, paddleHeight = 80;
let myY = canvas.height / 2 - paddleHeight / 2;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    playerId = data.playerId;
    info.innerText = `Tu es le joueur ${playerId === 0 ? "Gauche (W/S)" : "Droite (Flèches)"}`;
  }

  if (data.type === "state") {
    state = data;
  }

  if (data.type === "full") {
    info.innerText = "Serveur plein (2 joueurs max).";
  }
};

document.addEventListener("keydown", (e) => {
  if (playerId === null) return;

  if (playerId === 0) {
    if (e.key === "w" && myY > 0) myY -= 10;
    if (e.key === "s" && myY < canvas.height - paddleHeight) myY += 10;
  } else {
    if (e.key === "ArrowUp" && myY > 0) myY -= 10;
    if (e.key === "ArrowDown" && myY < canvas.height - paddleHeight) myY += 10;
  }

  ws.send(JSON.stringify({ type: "move", y: myY }));
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state) return;

  
  ctx.fillStyle = "#243056";
  for (let i = 0; i < canvas.height; i += 20) {
    ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
  }


  ctx.fillStyle = "#5eead4";
  ctx.fillRect(20, state.players[0].y, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - 30, state.players[1].y, paddleWidth, paddleHeight);


  ctx.fillRect(state.ball.x, state.ball.y, 10, 10);

  
  ctx.font = "24px Arial";
  ctx.fillText(state.players[0].score, canvas.width / 4, 30);
  ctx.fillText(state.players[1].score, (3 * canvas.width) / 4, 30);
}

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
