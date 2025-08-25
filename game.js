const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "blue";
ctx.fillRect(canvas.width/2 - 25, canvas.height/2 - 25, 50 , 50);
