let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

let ws = new WebSocket("ws://" + window.location.host);
let playerIndex = null;
let state = null;
let paddleY = 200;
const speed = 5;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") paddleY -= speed;
  if (e.key === "ArrowDown") paddleY += speed;
  sendMove();
});

let upBtn = document.getElementById("up");
let downBtn = document.getElementById("down");
upBtn.addEventListener("touchstart", () => moveMobile(-1));
downBtn.addEventListener("touchstart", () => moveMobile(1));

function moveMobile(dir) {
  paddleY += dir * speed;
  sendMove();
}

function sendMove() {
  if (playerIndex !== null) {
    ws.send(JSON.stringify({ type: "move", y: paddleY }));
  }
}

ws.onmessage = (msg) => {
  let data = JSON.parse(msg.data);
  if (data.type === "init") {
    playerIndex = data.player;
  } else if (data.type === "state") {
    state = data.state;
    draw();
  }
};

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!state) return;

  // balle
  ctx.fillStyle = "white";
  let b = state.ball;
  ctx.fillRect(b.x, b.y, b.size, b.size);

  // paddles
  ctx.fillRect(10, state.paddles[0].y, 10, 80);
  ctx.fillRect(580, state.paddles[1].y, 10, 80);

  // scores
  ctx.font = "20px Arial";
  ctx.fillText(state.scores[0], 250, 30);
  ctx.fillText(state.scores[1], 330, 30);
}
