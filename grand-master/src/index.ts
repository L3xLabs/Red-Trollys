import { WebSocketServer } from "ws";
import { GrandMaster } from "./state/GrandMaster";

const PORT = 8000;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`Web Socket Server Started on ${PORT}...`);
});

wss.on("connection", function connection(nodeSocket) {
  const node = GrandMaster.getInstance().addNode(nodeSocket);
  console.log(`Node connected`);
});
