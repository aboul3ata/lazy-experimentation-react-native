# Lazy Experimentation for React Native

Lazy Experimentation gives React Native apps local experiment assignment, feature delivery, and outcome capture through Lazy's control plane.

```bash
npm install @lazyweb/experimentation-react-native@0.1.1
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
