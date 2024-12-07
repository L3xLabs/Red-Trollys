import { WebSocket } from "ws";
import { Node } from "./Node";
import { HEALTHCHECK } from "../types/outgoing";
import { getRandomId } from "../util/getRandomId";

export class GrandMaster {
  private static instance: GrandMaster;

  private nodeMap: Map<string, Node> = new Map();

  private nodes: {
    id: string;
    node: Node;
    size: "SMALL" | "MID" | "LARGE";
  }[] = [];

  private trainers: Map<string, { master: Node; workers: Node[] }> = new Map();

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new GrandMaster();
    }

    return this.instance;
  }

  public addNode(nodeSocket: WebSocket) {
    const id = getRandomId();
    const node = new Node(id, nodeSocket);
    this.nodeMap.set(id, node);
    node.sendMessage({ method: HEALTHCHECK, msg: "Send Health data" });
    this.registerOnClose(id, nodeSocket);
    console.log(`node with id ${id} added to grand master`);
    return node;
  }

  public registerOnClose(id: string, nodeSocket: WebSocket) {
    nodeSocket.on("close", () => {
      this.nodeMap.delete(id);
      this.nodes.filter((n) => n.node.getId() != id);
    });
  }

  public classifyNode(id: string, strength: "SMALL" | "MID" | "LARGE") {
    const node = this.nodeMap.get(id);
    if (!node) {
      console.log(`Node not found wrong id ${id}`);
      return;
    }
    switch (strength) {
      case "SMALL":
        this.nodes.push({ id: id, node: node, size: "SMALL" });
        break;
      case "LARGE":
        this.nodes.push({ id: id, node: node, size: "LARGE" });
        break;
      case "MID":
        this.nodes.push({ id: id, node: node, size: "MID" });
        break;
    }
    console.log(this.nodes);
    return;
  }

  //@ts-ignore
  public execute(data) {
    console.log(`Execute called with api event:- ${data}`);
  }

  public getNode(id: string) {
    return this.nodeMap.get(id);
  }
}
