import { WebSocket } from "ws";
import { IncomingMessage, HEALTH, STRENGTH } from "../types/incoming";
// import { SubscriptionManager } from "./SubscriptionManager";

export class Node {
  private id: string;
  private nodeSocket: WebSocket;
  private subscriptions: string[] = [];

  constructor(id: string, nodeSocket: WebSocket) {
    this.id = id;
    this.nodeSocket = nodeSocket;
    this.addListeners();
  }

  public subscribe(channel: string) {
    this.subscriptions.push(channel);
  }

  public unsubscribe(channel: string) {
    this.subscriptions.filter((c) => c != channel);
  }

  //@ts-ignore
  public sendMessage(message) {
    this.nodeSocket.send(JSON.stringify(message));
  }

  private addListeners() {
    this.nodeSocket.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message); //type of parsed message should be Incoming message

      if (parsedMessage.method === HEALTH) {
      } else if (parsedMessage.method === STRENGTH) {
      }
    });
  }
}
