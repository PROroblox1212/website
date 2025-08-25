const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir les fichiers du client
app.use(express.static("public"));

let players = [];
let ball = { x: 400, y: 250, vx: 4, vy: 3 };
const paddleHeight = 80;
const canvasHeight = 500;

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  const playerId = players.length;
  players.push({ ws, y: 210, score: 0 });

  ws.send(JSON.stringify({ type: "init", playerId }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      players[playerId].y = data.y;
    }
  });

  ws.on("close", () => {
    players = players.filter((p) => p.ws !== ws);
  });
});

function gameLoop() {
  if (players.length < 2) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y <= 0 || ball.y >= canvasHeight - 10) {
    ball.vy *= -1;
  }

  let left = players[0];
  let right = players[1];

  if (ball.x <= 30 && ball.y >= left.y && ball.y <= left.y + paddleHeight) {
    ball.vx *= -1;
  }

  if (ball.x >= 760 && ball.y >= right.y && ball.y <= right.y + paddleHeight) {
    ball.vx *= -1;
  }

  if (ball.x <= 0) { players[1].score++; resetBall(); }
  if (ball.x >= 800) { players[0].score++; resetBall(); }

  const state = {
    type: "state",
    players: players.map((p) => ({ y: p.y, score: p.score })),
    ball,
  };

  players.forEach((p) => {
    if (p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify(state));
    }
  });
}

function resetBall() {
  ball = { x: 400, y: 250, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: 3 };
}

setInterval(gameLoop, 1000 / 60);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
