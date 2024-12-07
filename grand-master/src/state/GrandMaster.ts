import { WebSocket } from "ws";
import { Node } from "./Node";
import { getRandomId } from "../util/getRandomId";
import { STRENGTHCHECK, PROCESSDATA } from "../types/outgoing";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { ApiData } from "../types/api-types";
import {
  EngineMessage,
  NODEINFO,
  NodeSizes,
  SENDWORK,
} from "../types/engine-types";

interface ProcessMapping {
  process: ChildProcess;
  nodes: { size: NodeSizes; node: Node }[];
  data: {
    csvurl: string;
    layers: string[];
  };
  processId: string;
}

export class GrandMaster {
  private static instance: GrandMaster;

  private nodeMap: Map<string, Node> = new Map();

  private nodes: {
    id: string;
    node: Node;
    size: NodeSizes;
  }[] = [];

  private smallNodeNumber: number;
  private midNodeNumber: number;
  private largeNodeNumber: number;

  private processMap: Map<string, ProcessMapping> = new Map();

  private constructor() {
    this.smallNodeNumber = 0;
    this.midNodeNumber = 0;
    this.largeNodeNumber = 0;
  }

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
    node.sendMessage({ method: STRENGTHCHECK, msg: "Send Strenght data" });
    this.registerOnClose(id, nodeSocket);
    console.log(`node with id ${id} added to grand master`);
    return node;
  }

  //TODO: Write SetInterval for helth checks of the nodes

  public registerOnClose(id: string, nodeSocket: WebSocket) {
    nodeSocket.on("close", () => {
      this.nodeMap.delete(id);
      this.nodes.filter((n) => n.node.getId() != id);
    });
  }

  public classifyNode(id: string, strength: NodeSizes) {
    const node = this.nodeMap.get(id);
    if (!node) {
      console.log(`Node not found wrong id ${id}`);
      return;
    }
    switch (strength) {
      case NodeSizes.SMALL:
        this.nodes.push({ id: id, node: node, size: NodeSizes.SMALL });
        this.smallNodeNumber++;
        break;
      case NodeSizes.LARGE:
        this.nodes.push({ id: id, node: node, size: NodeSizes.LARGE });
        this.largeNodeNumber++;
        break;
      case NodeSizes.MID:
        this.nodes.push({ id: id, node: node, size: NodeSizes.MID });
        this.midNodeNumber++;
        break;
    }
    console.log(this.nodes);
    return;
  }

  private async createEngineScript(
    data: { csvurl: string; layers: string[] },
    processId: string,
  ): Promise<string> {
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const scriptPath = path.join(tempDir, `engine_${processId}.js`);
    const scriptContent = `
      // Injected variables
      const PROCESS_ID = "${processId}";
      
      // Engine logic

      //Data From node
        process.send();
    `;

    await fs.promises.writeFile(scriptPath, scriptContent);
    return scriptPath;
  }

  private selectAvailableNodes(
    count: number,
    sizesOfNodes: NodeSizes[],
  ): { size: NodeSizes; node: Node }[] {
    const availableNodes = this.nodes.filter(
      (n) =>
        !Array.from(this.processMap.values()).some((pm) =>
          pm.nodes.includes({ size: n.size, node: n.node }),
        ),
    );

    const selectedNodes: { size: NodeSizes; node: Node }[] = [];
    const sizeCountMap = new Map<NodeSizes, number>();

    sizesOfNodes.forEach((size) => {
      sizeCountMap.set(size, (sizeCountMap.get(size) || 0) + 1);
    });

    for (const [requiredSize, requiredCount] of sizeCountMap) {
      const nodesOfSize = availableNodes.filter((n) => n.size === requiredSize);

      if (nodesOfSize.length < requiredCount) {
        console.warn(
          `Warning: Not enough ${requiredSize} nodes. Required: ${requiredCount}, Available: ${nodesOfSize.length}`,
        );

        selectedNodes.push(
          ...nodesOfSize.map((n) => ({
            size: n.size as NodeSizes,
            node: n.node,
          })),
        );

        const compensationNodes = this.findCompensationNodes(
          requiredSize,
          requiredCount - nodesOfSize.length,
          availableNodes.filter((n) => !nodesOfSize.includes(n)),
        );

        selectedNodes.push(
          ...compensationNodes.map((n) => ({ size: n.size, node: n.node })),
        );
      } else {
        selectedNodes.push(
          ...nodesOfSize
            .slice(0, requiredCount)
            .map((n) => ({ size: n.size as NodeSizes, node: n.node })),
        );
      }
    }

    if (selectedNodes.length < count) {
      throw new Error(
        `Not enough nodes available. Required: ${count}, Selected: ${selectedNodes.length}`,
      );
    }

    return selectedNodes;
  }

  private findCompensationNodes(
    targetSize: NodeSizes,
    requiredCount: number,
    availableNodes: {
      id: string;
      node: Node;
      size: NodeSizes;
    }[],
  ): { id: string; node: Node; size: NodeSizes }[] {
    const compensationNodes: typeof availableNodes = [];
    let remainingCount = requiredCount;

    const sizeHierarchy = {
      [NodeSizes.SMALL]: [NodeSizes.MID, NodeSizes.LARGE],
      [NodeSizes.MID]: [NodeSizes.LARGE],
      [NodeSizes.LARGE]: [],
    };

    const validReplacementSizes = sizeHierarchy[targetSize];

    for (const replacementSize of validReplacementSizes) {
      if (remainingCount <= 0) break;

      const replacementNodes = availableNodes.filter(
        (n) => n.size === replacementSize && !compensationNodes.includes(n),
      );

      const nodesToTake = Math.min(replacementNodes.length, remainingCount);
      compensationNodes.push(...replacementNodes.slice(0, nodesToTake));
      remainingCount -= nodesToTake;
    }

    return compensationNodes;
  }

  public async execute(apiEvent: ApiData) {
    console.log(`Execute called with api event:- ${JSON.stringify(apiEvent)}`);

    const processId = getRandomId();
    const enginePath = await this.createEngineScript(apiEvent.data, processId);

    const engineProcess = fork(enginePath);

    engineProcess.on("message", (message: EngineMessage) => {
      console.log(
        `Received message from engine process ${processId}:`,
        message,
      );
      if (message.method === NODEINFO) {
        const selectedNodes = this.selectAvailableNodes(
          message.numberOfRequiredNodes,
          message.sizesOfNodes,
        );
        if (selectedNodes.length < message.numberOfRequiredNodes) {
          throw new Error(
            `Not enough available nodes. Required: ${message.numberOfRequiredNodes}, Available: ${selectedNodes.length}`,
          );
        }

        const processMapping: ProcessMapping = {
          process: engineProcess,
          nodes: selectedNodes,
          data: apiEvent.data,
          processId,
        };

        this.processMap.set(processId, processMapping);
      } else if (message.method === SENDWORK) {
        const processMapping = this.processMap.get(message.processId);
        if (!processMapping) {
          return;
        }
        //TODO: Assign work to nodes
      }
    });

    // Handle engine responses

    // Handle process completion
    engineProcess.on("exit", () => {
      console.log(`Process ${processId} completed`);
      this.cleanupProcess(processId);
    });

    return processId;
  }

  private cleanupProcess(processId: string) {
    const mapping = this.processMap.get(processId);
    if (mapping) {
      // Clean up temp worker script
      const scriptPath = path.join(__dirname, "temp", `engine_${processId}.js`);
      fs.unlink(scriptPath, (err) => {
        if (err) console.error(`Error cleaning up worker script: ${err}`);
      });

      this.processMap.delete(processId);
    }
  }

  public handleNodeResponse(nodeId: string, processId: string, data: any) {
    const mapping = this.processMap.get(processId);
    if (!mapping) {
      console.error(`No process mapping found for processId: ${processId}`);
      return;
    }

    // Forward node response to corresponding engine process
    mapping.process.send({
      type: "nodeData",
      data,
      nodeId,
    });
  }

  public getProcessMapping(processId: string): ProcessMapping | undefined {
    return this.processMap.get(processId);
  }

  public getNode(id: string) {
    return this.nodeMap.get(id);
  }
}
