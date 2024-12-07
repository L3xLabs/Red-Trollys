import { WebSocketServer } from "ws";
import { fork, ChildProcess } from "node:child_process";
import path from "path";
import { GrandMaster } from "./state/GrandMaster";
import { ApiData } from "./types/api-types";

const PORT = 8000;

type ErrorMessage = {
  error: string;
};

function startChildProcess(): ChildProcess {
  const childProcess = fork(path.join(__dirname, "api-handler.js"));

  childProcess.on("message", (message: ApiData | ErrorMessage) => {
    try {
      if ("error" in message) {
        console.error("Error from child process:", message.error);
      } else {
        console.log("Received message from child process:", message);
        GrandMaster.getInstance().execute(message);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  childProcess.on("error", (error) => {
    console.error("Child process error:", error);
  });

  childProcess.on("exit", (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
  });

  return childProcess;
}

const child = startChildProcess();

process.on("SIGTERM", () => {
  console.log("Parent process received SIGTERM");
  child.kill("SIGTERM");
  process.exit(0);
});

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`Web Socket Server Started on ${PORT}...`);
});

wss.on("connection", function connection(nodeSocket) {
  const node = GrandMaster.getInstance().addNode(nodeSocket);
  console.log(`Node connected`);
});
