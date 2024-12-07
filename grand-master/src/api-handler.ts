import { createClient } from "redis";
import { ApiData } from "./types/api-types";

async function main() {
  if (!process.send) {
    console.error("This script must be run as a child process");
    process.exit(1);
  }

  const redisClient = createClient();

  try {
    await redisClient.connect();
    console.log("Connected to redis");
  } catch (e) {
    console.error("Could not connect to redis:", e);
    process.exit(1);
  }

  while (true) {
    try {
      const message = await redisClient.rPop("messages");
      if (message) {
        // Send the message as an object, not a string
        if (typeof process.send === "function") {
          const messageObj: ApiData = {
            data: JSON.parse(message),
            timestamp: Date.now(),
          };
          process.send(messageObj);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error processing message:", error);
      if (typeof process.send === "function") {
        process.send({
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }
}

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM signal");
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
