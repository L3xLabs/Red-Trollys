import { createClient, RedisClientType } from "redis";
import { GrandMaster } from "./GrandMaster";

export class RedisManager {
  private static instance: RedisManager;
  private redisClient: RedisClientType;

  private constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }

    return this.instance;
  }

  public subscribeOnApi() {
    this.redisClient.subscribe("api", (message: string) => {
      const parsedMessage = JSON.parse(message);

      GrandMaster.getInstance().execute(parsedMessage);
    });
  }
}
