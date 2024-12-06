import { WebSocketServer } from "ws";

const PORT = 8000;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`Web Socket Server Started on ${PORT}...`);
});

wss.on("connection", function connection(userSocket) {
  console.log(`use with socket ${userSocket} connected`);
});
