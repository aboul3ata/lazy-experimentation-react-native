# Lazy Experimentation for React Native

This is a thin initializer around GrowthBook's official React Native-compatible SDK. GrowthBook owns feature fetching, caching, targeting, hashing, assignment, and exposure lifecycle.

```bash
npm install github:aboul3ata/lazy-experimentation-react-native#v0.1.0
```

```tsx
import {
  createLazyExperimentation,
  GrowthBookProvider,
  useFeatureIsOn,
} from "@lazyweb/experimentation-react-native";

const experiments = createLazyExperimentation({
  clientKey: "lwe_cfg_...",
  distinctId: deviceId,
});
await experiments.start();

export function App() {
  return (
    <GrowthBookProvider growthbook={experiments.growthbook}>
      <Root />
    </GrowthBookProvider>
  );
}

function Root() {
  const newOnboarding = useFeatureIsOn("new-onboarding");
  return newOnboarding ? <NewOnboarding /> : <CurrentOnboarding />;
}
```

Record outcomes with `experiments.capture("onboarding_completed")`.
