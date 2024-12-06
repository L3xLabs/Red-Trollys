import { WebSocket } from "ws";
import { Node } from "./Node";
import { SubscriptionManager } from "./SubscriptionManager";

export class GrandMaster {
  private static instance: GrandMaster;
  private nodeMap: Map<string, Node> = new Map();
  private smallNodes: Node[] = [];
  private midNodes: Node[] = [];
  private largeNodes: Node[] = [];

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new GrandMaster();
    }

    return this.instance;
  }

  public addNode(nodeSocket: WebSocket) {
    const id = this.getRandomId();
    const node = new Node(id, nodeSocket);
    this.nodeMap.set(id, node);
    this.registerOnClose(id, nodeSocket);
    console.log(`node with id ${id} added to grand master`);
    return node;
  }

  //TODO: Create method which subscribs the nodes on the required channels for data

  public registerOnClose(id: string, nodeSocket: WebSocket) {
    nodeSocket.on("close", () => {
      this.nodeMap.delete(id);
      SubscriptionManager.getInstance().nodeLeft(id);
    });
  }

  public getNode(id: string) {
    return this.nodeMap.get(id);
  }

  private getRandomId() {
    let S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  }
}
