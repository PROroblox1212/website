const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = [];
let gameState = {
  ball: { x: 300, y: 200, vx: 4, vy: 3 },
  paddles: [200, 200]
};

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  const playerId = players.length;
  players.push(ws);

  ws.send(JSON.stringify({ type: "welcome", playerId }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      gameState.paddles[playerId] = data.y;
    }
  });

  ws.on("close", () => {
    players = players.filter((p) => p !== ws);
  });
});

// boucle du jeu
setInterval(() => {
  // mouvement de la balle
  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;

  if (gameState.ball.y < 0 || gameState.ball.y > 400) gameState.ball.vy *= -1;

  // collisions avec raquettes
  if (
    gameState.ball.x < 20 &&
    gameState.ball.y > gameState.paddles[0] &&
    gameState.ball.y < gameState.paddles[0] + 80
  ) gameState.ball.vx *= -1;

  if (
    gameState.ball.x > 580 &&
    gameState.ball.y > gameState.paddles[1] &&
    gameState.ball.y < gameState.paddles[1] + 80
  ) gameState.ball.vx *= -1;

  // envoi aux joueurs
  const state = JSON.stringify({ type: "state", gameState });
  players.forEach((p) => p.readyState === WebSocket.OPEN && p.send(state));
}, 30);

app.use(express.static("public"));
server.listen(8080, () => console.log("Serveur lancé sur http://localhost:8080"));
