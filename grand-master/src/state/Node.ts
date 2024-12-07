import { WebSocket } from "ws";
import { IncomingMessage, HEALTH, STRENGTH } from "../types/incoming";
import { outgoingMessage } from "../types/outgoing";
import { GrandMaster } from "./GrandMaster";

export class Node {
  private id: string;
  private nodeSocket: WebSocket;
  private available: boolean;

  constructor(id: string, nodeSocket: WebSocket) {
    this.id = id;
    this.nodeSocket = nodeSocket;
    this.addListeners();
    this.available = true;
  }

  public sendMessage(message: outgoingMessage) {
    this.nodeSocket.send(JSON.stringify(message));
  }

  public setBusy() {
    this.available = false;
  }

  public isAvailable() {
    return this.available;
  }

  private addListeners() {
    this.nodeSocket.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message); //type of parsed message should be Incoming message

      if (parsedMessage.method === HEALTH) {
        console.log("Health msg");
      } else if (parsedMessage.method === STRENGTH) {
        GrandMaster.getInstance().classifyNode(this.id, parsedMessage.strength);
      } else {
        console.log("msg received");
      }
    });
  }

  public getId() {
    return this.id;
  }
}
