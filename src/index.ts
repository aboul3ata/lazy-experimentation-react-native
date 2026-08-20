import {GrowthBook} from "@growthbook/growthbook-react";
import type {Attributes, EventProperties, InitResponse} from "@growthbook/growthbook";
import {growthbookTrackingPlugin} from "@growthbook/growthbook/plugins";

export {GrowthBookProvider, FeaturesReady, useFeature, useFeatureIsOn, useGrowthBook} from "@growthbook/growthbook-react";

export const LAZY_EXPERIMENTATION_API_HOST = "https://experimentation.lazyweb.com";

export interface LazyExperimentationOptions {
  clientKey: string;
  distinctId: string;
  attributes?: Attributes;
  apiHost?: string;
  timeoutMs?: number;
}

export class LazyExperimentation {
  readonly growthbook: GrowthBook;
  readonly #timeoutMs: number;

  constructor(options: LazyExperimentationOptions) {
    const clientKey = options.clientKey?.trim();
    const distinctId = options.distinctId?.trim();
    if (!clientKey) throw new Error("clientKey is required");
    if (!distinctId || distinctId.length > 256 || distinctId.includes("@")) {
      throw new Error("distinctId must be an opaque identifier");
    }
    const apiHost = new URL(options.apiHost ?? LAZY_EXPERIMENTATION_API_HOST).origin;
    this.#timeoutMs = options.timeoutMs ?? 2_000;
    this.growthbook = new GrowthBook({
      apiHost,
      clientKey,
      attributes: {...options.attributes, id: distinctId},
      plugins: [growthbookTrackingPlugin({
        ingestorHost: apiHost,
        queueFlushInterval: 0,
        dedupeKeyAttributes: ["id"],
        eventFilter: ({eventName}) => eventName === "Experiment Viewed" || validEventName(eventName),
        transport: "fetch",
      })],
    });
  }

  start(): Promise<InitResponse> {
    return this.growthbook.init({timeout: this.#timeoutMs, streaming: false});
  }

  capture(eventName: string, properties: EventProperties = {}, value?: number): void {
    if (!validEventName(eventName)) throw new Error("eventName must be a lowercase Lazyweb key");
    if (value !== undefined && !Number.isFinite(value)) throw new Error("value must be finite");
    this.growthbook.logEvent(eventName, value === undefined ? properties : {...properties, value});
  }

  destroy(): void {
    this.growthbook.destroy();
  }
}

export function createLazyExperimentation(options: LazyExperimentationOptions): LazyExperimentation {
  return new LazyExperimentation(options);
}

function validEventName(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{0,127}$/.test(value);
}
