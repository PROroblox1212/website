const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let players = [];
let gameState = {
  ball: { x: 300, y: 200, vx: 3, vy: 2, size: 10 },
  paddles: [ { y: 200 }, { y: 200 } ],
  scores: [0, 0]
};

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  const playerIndex = players.length;
  players.push(ws);

  ws.send(JSON.stringify({ type: "init", player: playerIndex }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      gameState.paddles[playerIndex].y = data.y;
    }
  });

  ws.on("close", () => {
    players = players.filter(p => p !== ws);
  });
});

function gameLoop() {
  // Bouger la balle
  let b = gameState.ball;
  b.x += b.vx;
  b.y += b.vy;

  // collisions mur haut/bas
  if (b.y <= 0 || b.y >= 400) b.vy *= -1;

  // collisions paddles
  let paddleHeight = 80, paddleWidth = 10;
  // gauche
  if (b.x <= 20 && b.y >= gameState.paddles[0].y && b.y <= gameState.paddles[0].y + paddleHeight) {
    b.vx *= -1;
  }
  // droite
  if (b.x >= 580 && b.y >= gameState.paddles[1].y && b.y <= gameState.paddles[1].y + paddleHeight) {
    b.vx *= -1;
  }

  // score
  if (b.x < 0) {
    gameState.scores[1]++;
    resetBall();
  }
  if (b.x > 600) {
    gameState.scores[0]++;
    resetBall();
  }

  // broadcast
  players.forEach(p => {
    p.send(JSON.stringify({ type: "state", state: gameState }));
  });
}

function resetBall() {
  gameState.ball = { x: 300, y: 200, vx: 3 * (Math.random() > 0.5 ? 1 : -1), vy: 2, size: 10 };
}

setInterval(gameLoop, 1000 / 60);

server.listen(8080, () => {
  console.log("Serveur lancé sur http://localhost:8080");
});
