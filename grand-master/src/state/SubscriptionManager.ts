import { createClient, RedisClientType } from "redis";
import { GrandMaster } from "./GrandMaster";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private redisClient: RedisClientType;

  private subscriptions: Map<string, string[]> = new Map(); //<nodeId, [stream1, stream2]>
  private reverseSubscriptions: Map<string, string[]> = new Map(); //<stream1, [nodeId1, nodeId2]>

  private constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }

    return this.instance;
  }

  public subscribe(nodeId: string, channel: string) {
    if (this.subscriptions.get(nodeId)?.includes(channel)) {
      return;
    }

    const currentSubscription = this.subscriptions.get(nodeId) || [];
    this.subscriptions.set(nodeId, currentSubscription.concat(channel));

    GrandMaster.getInstance().getNode(nodeId)?.subscribe(channel);

    const currentReverseSubscription =
      this.reverseSubscriptions.get(channel) || [];
    this.reverseSubscriptions.set(
      channel,
      currentReverseSubscription.concat(nodeId),
    );

    if (this.reverseSubscriptions.get(channel)?.length === 1) {
      this.redisClient.subscribe(channel, this.redisCallbackHandler);
    }
  }

  private redisCallbackHandler = (message: string, channel: string) => {
    const parsedMessage = JSON.parse(message);

    this.reverseSubscriptions
      .get(channel)
      ?.forEach((nodeId) =>
        GrandMaster.getInstance().getNode(nodeId)?.sendMessage(parsedMessage),
      );
  };

  public unsubscribe(nodeId: string, channel: string) {
    const currentSubscriptions = this.subscriptions.get(nodeId);

    if (currentSubscriptions) {
      const newSubscribtions = currentSubscriptions.filter((c) => c != channel);
      this.subscriptions.set(nodeId, newSubscribtions || []);

      GrandMaster.getInstance().getNode(nodeId)?.unsubscribe(channel);
    }

    const reverseSubscriptions = this.reverseSubscriptions.get(channel);

    if (reverseSubscriptions) {
      const newReverseSubscriptions = reverseSubscriptions.filter(
        (n) => n != nodeId,
      );
      this.reverseSubscriptions.set(channel, newReverseSubscriptions);

      if (this.reverseSubscriptions.get(channel)?.length === 0) {
        this.reverseSubscriptions.delete(channel);
        this.redisClient.unsubscribe(channel);
      }
    }
  }

  //We need this nodeLeft function because when user leaves the ws server we want to unsubscribe him from all his subscriptions
  public nodeLeft(nodeId: string) {
    console.log(`user with id ${nodeId} left`);
    this.subscriptions.get(nodeId)?.forEach((c) => this.unsubscribe(nodeId, c));
  }

  public getSubscriptions(userId: string) {
    return this.subscriptions.get(userId) || [];
  }
}
