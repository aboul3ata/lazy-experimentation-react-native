import {setPolyfills} from "@growthbook/growthbook";
import {afterEach, expect, it, vi} from "vitest";
import {createLazyExperimentation} from "../src/index.js";

afterEach(() => vi.unstubAllGlobals());

it("uses GrowthBook for React Native assignment and event delivery", async () => {
  const requests: Array<{url: string; body?: string}> = [];
  const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requests.push({url, body: init?.body?.toString()});
    if (url.includes("/api/features/")) {
      return new Response(JSON.stringify({
        features: {
          "new-onboarding": {
            defaultValue: false,
            rules: [{variations: [false, true], coverage: 1, seed: "new-onboarding"}],
          },
        },
      }), {status: 200, headers: {"content-type": "application/json"}});
    }
    return new Response(JSON.stringify({accepted: 1}), {status: 200});
  });
  vi.stubGlobal("fetch", mockFetch);
  setPolyfills({fetch: mockFetch});

  const experiments = createLazyExperimentation({
    clientKey: "lwe_cfg_test",
    distinctId: "device-123",
    apiHost: "https://example.test",
  });
  expect((await experiments.start()).success).toBe(true);
  experiments.growthbook.evalFeature("new-onboarding");
  experiments.capture("onboarding_completed", {steps: 3});
  await new Promise((resolve) => setTimeout(resolve, 10));

  const tracked = requests.filter(({url}) => url.includes("/track?client_key="));
  expect(tracked.length).toBeGreaterThanOrEqual(1);
  expect(tracked.map(({body}) => body).join(" ")).toContain("onboarding_completed");
  experiments.destroy();
});
